from mysql.connector import pooling
from mysql.connector import Error
from particles_testing_db.database_type  import DatabaseType
from config.config import Config


class BaseConnection:

    def __init__(self, database_config, pool_name):
        self.database_config = database_config
        self.pool_name = pool_name
        self.pool_size = database_config.get('pool_size', 15)
        self.pool = None

    def get_pool(self):
        if self.pool is None:
            try:
                required_params = ['host', 'port', 'database', 'username', 'password']
                for param in required_params:
                    if param not in self.database_config:
                        raise ValueError(f"Parámetro de base de datos faltante: {param}")

                self.pool = pooling.MySQLConnectionPool(
                    pool_name=self.pool_name,
                    pool_size=self.pool_size,
                    host=self.database_config['host'],
                    port=self.database_config['port'],
                    database=self.database_config['database'],
                    user=self.database_config['username'],
                    password=self.database_config['password']
                )
                return self.pool
            except Error as e:
                print(f'Error getting connection pool for {self.database_config.get("database")}: {e}')
                raise
        return self.pool

    def get_connection(self):
        return self.get_pool().get_connection()

    def release_connection(self, connection):
        connection.close()


class ConnectionManager:
    _instances = {}
    _config = None

    @classmethod
    def _get_config(cls):
        if cls._config is None:
            cls._config = Config()
        return cls._config

    @classmethod
    def get_connection(cls, db_type=DatabaseType.TESTING):
        if isinstance(db_type, str):
            try:
                db_type = DatabaseType(db_type)
            except ValueError:
                raise ValueError(f"Tipo de base de datos no válido: {db_type}")

        db_type_value = db_type.value

        if db_type_value not in cls._instances:
            config = cls._get_config()

            if db_type == DatabaseType.TESTING:
                database_config = config.testing_db_config
                pool_name = 'testing_pool'
            elif db_type == DatabaseType.LEARNING:
                database_config = config.learning_db_config
                pool_name = 'learning_pool'
            else:
                raise ValueError(f"Tipo de base de datos no soportado: {db_type}")

            if not database_config:
                raise ValueError(f"Configuración no encontrada para la base de datos: {db_type_value}")

            cls._instances[db_type_value] = BaseConnection(database_config, pool_name)

        return cls._instances[db_type_value].get_connection()

    @classmethod
    def release_connection(cls, connection, db_type=DatabaseType.TESTING):
        if isinstance(db_type, str):
            try:
                db_type = DatabaseType(db_type)
            except ValueError:
                raise ValueError(f"Tipo de base de datos no válido: {db_type}")

        db_type_value = db_type.value

        if db_type_value in cls._instances:
            cls._instances[db_type_value].release_connection(connection)


class Connection:

    @classmethod
    def get_connection(cls):
        return ConnectionManager.get_connection(DatabaseType.TESTING)

    @classmethod
    def release_connection(cls, connection):
        ConnectionManager.release_connection(connection, DatabaseType.TESTING)


if __name__ == '__main__':
    try:
        conn_testing = ConnectionManager.get_connection(DatabaseType.TESTING)
        print(f"Conexión a testing establecida: {conn_testing}")
        ConnectionManager.release_connection(conn_testing, DatabaseType.TESTING)

        conn_learning = ConnectionManager.get_connection(DatabaseType.LEARNING)
        print(f"Conexión a learning establecida: {conn_learning}")
        ConnectionManager.release_connection(conn_learning, DatabaseType.LEARNING)
    except Exception as e:
        print(f"Error en test: {e}")