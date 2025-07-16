from mysql.connector import pooling
from mysql.connector import Error


class Connection:
    DATABASE = 'particulas_db'
    USERNAME = 'root'
    PASSWORD = 'neutrino'
    DB_PORT = '3306'
    HOST = 'localhost'
    POOL_SIZE = 5
    POOL_NAME = 'particula_pool'
    pool = None

    @classmethod
    def get_pool(cls):
        if cls.pool is None:
            try:
                cls.pool = pooling.MySQLConnectionPool(
                    pool_name=cls.POOL_NAME,
                    pool_size=cls.POOL_SIZE,
                    host=cls.HOST,
                    port=cls.DB_PORT,
                    database=cls.DATABASE,
                    user=cls.USERNAME,
                    password=cls.PASSWORD
                )
                return cls.pool
            except Error as e:
                print(f'Error getting connection pool: {e}')
        else:
            return cls.pool

    @classmethod
    def get_connection(cls):
        return cls.get_pool().get_connection()

    @classmethod
    def release_connection(cls, connection):
        connection.close()


if __name__ == '__main__':
    pool = Connection.get_pool()
    print(pool)
    connection1 = pool.get_connection()
    print(connection1)
    Connection.release_connection(connection1)
    print(f'Connection released: conection1')