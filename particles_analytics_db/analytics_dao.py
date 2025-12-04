import mysql.connector
from mysql.connector import pooling
from datetime import datetime, date
import json


class AnalyticsDAO:
    def __init__(self, db_config):
        self.pool = mysql.connector.pooling.MySQLConnectionPool(
            pool_name="analytics_pool",
            pool_size=db_config.get('pool_size', 10),
            **{k: v for k, v in db_config.items() if k != 'pool_size'}
        )

    def get_connection(self):
        return self.pool.get_connection()

    def log_connection(self, session_id, user_ip, user_agent):
        connection = self.get_connection()
        try:
            with connection.cursor() as cursor:
                sql = """
                INSERT INTO daily_connections (session_id, user_ip, user_agent, connection_date, connection_time)
                VALUES (%s, %s, %s, %s, %s)
                """
                now = datetime.now()
                cursor.execute(sql, (session_id, user_ip, user_agent, now.date(), now))
                connection.commit()
        except Exception as e:
            print(f"Error logging connection: {e}")
        finally:
            connection.close()

    def log_page_visit(self, session_id, page_url):
        connection = self.get_connection()
        try:
            with connection.cursor() as cursor:
                sql = """
                INSERT INTO page_visits (session_id, page_url, visit_time)
                VALUES (%s, %s, %s)
                """
                cursor.execute(sql, (session_id, page_url, datetime.now()))
                connection.commit()
        except Exception as e:
            print(f"Error logging page visit: {e}")
        finally:
            connection.close()

    def log_quiz_completion(self, session_id, quiz_filters, score_percentage, total_questions, correct_answers):
        connection = self.get_connection()
        try:
            with connection.cursor() as cursor:
                sql = """
                INSERT INTO quiz_completions (session_id, quiz_filters, score_percentage, total_questions, correct_answers, completion_time)
                VALUES (%s, %s, %s, %s, %s, %s)
                """
                cursor.execute(sql, (
                    session_id,
                    json.dumps(quiz_filters),
                    score_percentage,
                    total_questions,
                    correct_answers,
                    datetime.now()
                ))
                connection.commit()
        except Exception as e:
            print(f"Error logging quiz completion: {e}")
        finally:
            connection.close()

    def get_daily_connections(self, target_date=None):
        if target_date is None:
            target_date = date.today()

        connection = self.get_connection()
        try:
            with connection.cursor(dictionary=True) as cursor:
                sql = """
                SELECT COUNT(DISTINCT session_id) as connection_count
                FROM daily_connections 
                WHERE connection_date = %s
                """
                cursor.execute(sql, (target_date,))
                result = cursor.fetchone()
                return result['connection_count'] if result else 0
        except Exception as e:
            print(f"Error getting daily connections: {e}")
            return 0
        finally:
            connection.close()

    def get_exercise_visits(self, target_date=None):
        if target_date is None:
            target_date = date.today()

        connection = self.get_connection()
        try:
            with connection.cursor(dictionary=True) as cursor:
                sql = """
                SELECT COUNT(*) as exercise_visits
                FROM page_visits 
                WHERE page_url LIKE '%exercise.html%' 
                AND DATE(visit_time) = %s
                """
                cursor.execute(sql, (target_date,))
                result = cursor.fetchone()
                return result['exercise_visits'] if result else 0
        except Exception as e:
            print(f"Error getting exercise visits: {e}")
            return 0
        finally:
            connection.close()

    def get_quiz_completion_stats(self, target_date=None):
        if target_date is None:
            target_date = date.today()

        connection = self.get_connection()
        try:
            with connection.cursor(dictionary=True) as cursor:
                sql = """
                SELECT 
                    COUNT(*) as total_completions,
                    AVG(score_percentage) as avg_score,
                    COUNT(DISTINCT session_id) as unique_sessions
                FROM quiz_completions 
                WHERE DATE(completion_time) = %s
                """
                cursor.execute(sql, (target_date,))
                return cursor.fetchone()
        except Exception as e:
            print(f"Error getting quiz stats: {e}")
            return {'total_completions': 0, 'avg_score': 0, 'unique_sessions': 0}
        finally:
            connection.close()

    def get_detailed_stats(self, start_date, end_date):
        connection = self.get_connection()
        try:
            with connection.cursor(dictionary=True) as cursor:
                sql = """
                    SELECT 
                        connection_date as date,
                        unique_sessions,
                        exercise_visits,
                        quiz_completions,
                        avg_score
                    FROM (
                        -- Sesiones únicas por día
                        SELECT 
                            connection_date,
                            COUNT(DISTINCT session_id) as unique_sessions
                        FROM daily_connections 
                        WHERE connection_date BETWEEN %s AND %s
                        GROUP BY connection_date
                    ) dc
                    LEFT JOIN (
                        -- Visitas a exercise por día
                        SELECT 
                            DATE(visit_time) as visit_date,
                            COUNT(*) as exercise_visits
                        FROM page_visits 
                        WHERE page_url LIKE '%exercise.html%'
                        AND DATE(visit_time) BETWEEN %s AND %s
                        GROUP BY DATE(visit_time)
                    ) pv ON dc.connection_date = pv.visit_date
                    LEFT JOIN (
                        -- Quizzes completados por día
                        SELECT 
                            DATE(completion_time) as quiz_date,
                            COUNT(*) as quiz_completions,  -- ← SOLUCIÓN: todos los quizzes
                            COALESCE(AVG(score_percentage), 0) as avg_score
                        FROM quiz_completions 
                        WHERE DATE(completion_time) BETWEEN %s AND %s
                        GROUP BY DATE(completion_time)
                    ) qc ON dc.connection_date = qc.quiz_date
                    ORDER BY dc.connection_date DESC
                    """
                cursor.execute(sql, (start_date, end_date, start_date, end_date, start_date, end_date))
                return cursor.fetchall()
        except Exception as e:
            print(f"Error getting detailed stats: {e}")
            return []
        finally:
            connection.close()

    def get_session_details(self, target_date=None):
        if target_date is None:
            target_date = date.today()

        connection = self.get_connection()
        try:
            with connection.cursor(dictionary=True) as cursor:
                sql = """
                SELECT 
                    dc.session_id,
                    DATE(dc.connection_time) as connection_date,
                    -- Información de conexión
                    MIN(dc.connection_time) as first_connection,
                    MAX(dc.connection_time) as last_activity,
                    MIN(dc.user_ip) as user_ip,

                    -- Información de quizzes (puede ser NULL)
                    COUNT(qc.id) as quizzes_completed,
                    COALESCE(AVG(qc.score_percentage), 0) as avg_score,
                    COALESCE(SUM(qc.total_questions), 0) as total_questions,
                    COALESCE(SUM(qc.correct_answers), 0) as total_correct_answers

                FROM daily_connections dc
                LEFT JOIN quiz_completions qc ON dc.session_id = qc.session_id 
                    AND DATE(qc.completion_time) = DATE(dc.connection_time)
                WHERE DATE(dc.connection_time) = %s
                GROUP BY dc.session_id, DATE(dc.connection_time)
                ORDER BY quizzes_completed DESC, avg_score DESC
                """
                cursor.execute(sql, (target_date,))
                return cursor.fetchall()
        except Exception as e:
            print(f"Error getting session details: {e}")
            return []
        finally:
            connection.close()