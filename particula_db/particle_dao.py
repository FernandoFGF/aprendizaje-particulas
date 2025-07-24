from particula_db.connection import Connection
from particula_db.particle_image import Particle
import random
import time


class ParticleDAO:
    SELECT_ALL = 'SELECT * FROM particula_imagen ORDER BY id'
    INSERT = 'INSERT INTO particula_imagen(path, tipo_interaccion, sabor, modo_interaccion) VALUES(%s, %s, %s, %s)'
    UPDATE = 'UPDATE particula_imagen SET path=%s, tipo_interaccion=%s, sabor=%s, modo_interaccion=%s WHERE id=%s'
    DELETE = 'DELETE FROM particula_imagen WHERE id=%s'

    @classmethod
    def get_all(cls):
        connection = None
        try:
            connection = Connection.get_connection()
            cursor = connection.cursor()
            cursor.execute(cls.SELECT_ALL)
            records = cursor.fetchall()
            # Mapeo de clase-tabla particula_imagen
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
            values = (particle.path, particle.interaction_type,
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
            values = (particle.path, particle.interaction_type,
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
            id_query = "SELECT id FROM particula_imagen"
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
            fields = ['id', 'path']
            if show_interaction:
                fields.append('tipo_interaccion')
            if show_flavor:
                fields.append('sabor')
            if show_mode:
                fields.append('modo_interaccion')

            query = f"""SELECT {','.join(fields)}
                        FROM particula_imagen
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


if __name__ == '__main__':
    # Seleccionar los clientes
    particles = ParticleDAO.get_all()
    for particle in particles:
        print(particle)