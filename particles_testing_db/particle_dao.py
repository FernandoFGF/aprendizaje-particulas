from particles_testing_db.connection import ConnectionManager
from particles_testing_db.database_type import DatabaseType
from particles_testing_db.particle_image import Particle
import random
import time


class BaseParticleDAO:
    SELECT_ALL = 'SELECT * FROM particle_quizzes ORDER BY id'
    INSERT = 'INSERT INTO particle_quizzes(image_path, interaction_type, flavor, interaction_mode, neutrino_energy) VALUES(%s, %s, %s, %s, %s)'
    UPDATE = 'UPDATE particle_quizzes SET image_path=%s, interaction_type=%s, flavor=%s, interaction_mode=%s, neutrino_energy=%s WHERE id=%s'
    DELETE = 'DELETE FROM particle_quizzes WHERE id=%s'

    def __init__(self, db_type=DatabaseType.TESTING):
        if isinstance(db_type, str):
            try:
                db_type = DatabaseType(db_type)
            except ValueError:
                raise ValueError(f"Tipo de base de datos no válido: {db_type}")
        self.db_type = db_type

    def get_all(self):
        connection = None
        try:
            connection = ConnectionManager.get_connection(self.db_type)
            cursor = connection.cursor()
            cursor.execute(self.SELECT_ALL)
            records = cursor.fetchall()

            particles = []
            for record in records:
                particle = Particle(record[0], record[1], record[2], record[3], record[4], record[9])
                particles.append(particle)
            return particles
        except Exception as e:
            print(f'Error fetching particles from {self.db_type}: {e}')
            return []
        finally:
            if connection is not None:
                cursor.close()
                ConnectionManager.release_connection(connection, self.db_type)

    def insert(self, particle):
        connection = None
        try:
            connection = ConnectionManager.get_connection(self.db_type)
            cursor = connection.cursor()
            values = (particle.image_path, particle.interaction_type,
                      particle.flavor, particle.interaction_mode, particle.neutrino_energy)
            cursor.execute(self.INSERT, values)
            connection.commit()
            return cursor.rowcount
        except Exception as e:
            print(f'Error inserting particle in {self.db_type}: {e}')
            return 0
        finally:
            if connection is not None:
                cursor.close()
                ConnectionManager.release_connection(connection, self.db_type)

    def update(self, particle):
        connection = None
        try:
            connection = ConnectionManager.get_connection(self.db_type)
            cursor = connection.cursor()
            values = (particle.image_path, particle.interaction_type,
                      particle.flavor, particle.interaction_mode,
                      particle.neutrino_energy, particle.id)
            cursor.execute(self.UPDATE, values)
            connection.commit()
            return cursor.rowcount
        except Exception as e:
            print(f'Error updating particle in {self.db_type}: {e}')
            return 0
        finally:
            if connection is not None:
                cursor.close()
                ConnectionManager.release_connection(connection, self.db_type)

    def delete(self, particle):
        connection = None
        try:
            connection = ConnectionManager.get_connection(self.db_type)
            cursor = connection.cursor()
            values = (particle.id,)
            cursor.execute(self.DELETE, values)
            connection.commit()
            return cursor.rowcount
        except Exception as e:
            print(f'Error deleting particle from {self.db_type}: {e}')
            return 0
        finally:
            if connection is not None:
                cursor.close()
                ConnectionManager.release_connection(connection, self.db_type)

    def get_filtered_images(self, show_interaction=True, show_flavor=True, show_mode=True, show_particles=True,
                            count='5'):
        connection = None
        try:
            id_query = "SELECT id FROM particle_quizzes"
            connection = ConnectionManager.get_connection(self.db_type)
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

            fields = ['id', 'image_path']
            if show_interaction:
                fields.append('interaction_type')
            if show_flavor:
                fields.append('flavor')
            if show_mode:
                fields.append('interaction_mode')
            if show_particles:
                fields.extend([
                    'heavy_ion_track_count',
                    'light_ion_track_count',
                    'photon_shower_count',
                    'electron_shower_count'
                ])
            fields.extend(['neutrino_energy', 'invisible_energy'])

            query = f"""SELECT {','.join(fields)}
                        FROM particle_quizzes
                        WHERE id IN ({','.join(all_ids)})
                        ORDER BY FIELD(id, {','.join(all_ids)})"""

            cursor.execute(query)
            return cursor.fetchall()
        except Exception as e:
            print(f'Error loading filtered images from {self.db_type}: {e}')
            return []
        finally:
            if connection is not None:
                cursor.close()
                ConnectionManager.release_connection(connection, self.db_type)

    def get_all_particles(self):
        connection = None
        try:
            connection = ConnectionManager.get_connection(self.db_type)
            cursor = connection.cursor(dictionary=True)
            query = """SELECT id, image_path, interaction_type, flavor, interaction_mode, 
                              heavy_ion_track_count, light_ion_track_count, 
                              photon_shower_count, electron_shower_count, 
                              neutrino_energy, invisible_energy 
                       FROM particle_quizzes ORDER BY id"""
            cursor.execute(query)
            return cursor.fetchall()
        except Exception as e:
            print(f'Error loading all particles from {self.db_type}: {e}')
            return []
        finally:
            if connection is not None:
                cursor.close()
                ConnectionManager.release_connection(connection, self.db_type)


class TestingParticleDAO(BaseParticleDAO):

    def __init__(self):
        super().__init__(DatabaseType.TESTING)


class LearningParticleDAO(BaseParticleDAO):

    def __init__(self):
        super().__init__(DatabaseType.LEARNING)


if __name__ == '__main__':
    testing_dao = TestingParticleDAO()
    learning_dao = LearningParticleDAO()

    print("Testing database particles:")
    testing_particles = testing_dao.get_all()
    for particle in testing_particles[:3]:
        print(particle)

    print("\nLearning database particles:")
    learning_particles = learning_dao.get_all()
    for particle in learning_particles[:3]:
        print(particle)