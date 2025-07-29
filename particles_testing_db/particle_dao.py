from particles_testing_db.connection import Connection
from particles_testing_db.particle_image import Particle
import random
import time


class ParticleDAO:
    SELECT_ALL = 'SELECT * FROM particle_quizzes ORDER BY id'
    INSERT = 'INSERT INTO particle_quizzes(image_path, interaction_type, flavor, interaction_mode) VALUES(%s, %s, %s, %s)'
    UPDATE = 'UPDATE particle_quizzes SET image_path=%s, interaction_type=%s, flavor=%s, interaction_mode=%s WHERE id=%s'
    DELETE = 'DELETE FROM particle_quizzes WHERE id=%s'

    @classmethod
    def get_all(cls):
        connection = None
        try:
            connection = Connection.get_connection()
            cursor = connection.cursor()
            cursor.execute(cls.SELECT_ALL)
            records = cursor.fetchall()
            # Mapeo de clase-tabla particle_quizzes
            particles = []
            for record in records:
                particle = Particle(record[0], record[1], record[2], record[3], record[4])
                particles.append(particle)
            return particles
        except Exception as e:
            print(f'Error fetching particles: {e}')
        finally:
            if connection is not None:
                cursor.close()
                Connection.release_connection(connection)

    @classmethod
    def insert(cls, particle):
        conection = None
        try:
            conection = Connection.get_connection()
            cursor = conection.cursor()
            values = (particle.image_path, particle.interaction_type,
                       particle.flavor, particle.interaction_mode)
            cursor.execute(cls.INSERT, values)
            conection.commit()
            return cursor.rowcount
        except Exception as e:
            print(f'Error inserting particle: {e}')
        finally:
            if conection is not None:
                cursor.close()
                Connection.release_connection(conection)

    @classmethod
    def update(cls, particle):
        connection = None

        try:
            connection = Connection.get_connection()
            cursor = connection.cursor()
            values = (particle.image_path, particle.interaction_type,
                       particle.flavor, particle.interaction_mode,
                       particle.id)
            cursor.execute(cls.UPDATE, values)
            connection.commit()
            return cursor.rowcount
        except Exception as e:
            print(f'Error updating particle: {e}')
        finally:
            if connection is not None:
                cursor.close()
                Connection.release_connection(connection)

    @classmethod
    def delete(cls, particle):
        connection = None
        try:
            connection = Connection.get_connection()
            cursor = connection.cursor()
            values = (particle.id,)
            cursor.execute(cls.DELETE, values)
            connection.commit()
            return cursor.rowcount
        except Exception as e:
            print(f'Error deleting particle: {e}')
        finally:
            if connection is not None:
                cursor.close()
                Connection.release_connection(connection)

    @classmethod
    def get_filtered_images(cls, show_interaction=True, show_flavor=True, show_mode=True, count='5'):
        connection = None
        try:
            id_query = "SELECT id FROM particle_quizzes"
            connection = Connection.get_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute(id_query)
            all_ids = [str(row['id']) for row in cursor.fetchall()]

            if not all_ids:
                return []

            random.seed(time.time())
            random.shuffle(all_ids)

            try:
                all_ids = all_ids[:int(count)]
            except ValueError:
                pass

            # Construir consulta dinámica
            fields = ['id', 'image_path']
            if show_interaction:
                fields.append('interaction_type')
            if show_flavor:
                fields.append('flavor')
            if show_mode:
                fields.append('interaction_mode')

            query = f"""SELECT {','.join(fields)}
                        FROM particle_quizzes
                        WHERE id IN ({','.join(all_ids)})
                        ORDER BY FIELD(id, {','.join(all_ids)})"""

            cursor.execute(query)
            return cursor.fetchall()
        except Exception as e:
            print(f'Error loading filtered images: {e}')
            return []
        finally:
            if connection is not None:
                cursor.close()
                Connection.release_connection(connection)

    @classmethod
    def get_all_particles(cls):
        connection = None
        try:
            connection = Connection.get_connection()
            cursor = connection.cursor(dictionary=True)
            query = "SELECT id, image_path, interaction_type, flavor, interaction_mode FROM particle_quizzes ORDER BY id"
            cursor.execute(query)
            return cursor.fetchall()
        except Exception as e:
            print(f'Error loading all particles: {e}')
            return []
        finally:
            if connection is not None:
                cursor.close()
                Connection.release_connection(connection)


if __name__ == '__main__':
    # Seleccionar los clientes
    particles = ParticleDAO.get_all()
    for particle in particles:
        print(particle)