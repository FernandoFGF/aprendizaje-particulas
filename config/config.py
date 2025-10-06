import json
import os
from pathlib import Path


class Config:
    def __init__(self, env=None):
        if env is None:
            env = os.getenv('APP_ENV', os.getenv('FLASK_ENV', 'production'))

        self.env = env
        self.config_data = self._load_config()

    def _load_config(self):
        config_dir = Path(__file__).parent
        config_file = config_dir / f"{self.env}.json"

        if not config_file.exists():
            raise FileNotFoundError(f"Archivo de configuración no encontrado: {config_file}")

        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            raise ValueError(f"Error al parsear el archivo de configuración {config_file}: {e}")

    def get(self, key, default=None):
        return self.config_data.get(key, default)

    @property
    def base_url(self):
        return self.get('BASE_URL', '')

    @property
    def secret_key(self):
        return os.getenv('SECRET_KEY', self.get('SECRET_KEY'))

    @property
    def session_cookie_secure(self):
        return self.get('SESSION_COOKIE_SECURE', False)

    @property
    def images_dir(self):
        return self.get('IMAGES_DIR')

    @property
    def serve_images_via_flask(self):
        return self.get('SERVE_IMAGES_VIA_FLASK', True)

    @property
    def debug(self):
        return self.get('DEBUG', False)

    def get_database_config(self, db_type):
        databases = self.get('DATABASES', {})
        return databases.get(db_type, {})

    @property
    def testing_db_config(self):
        return self.get_database_config('testing')

    @property
    def learning_db_config(self):
        return self.get_database_config('learning')

    @property
    def login_credentials(self):
        return self.get('LOGIN_CREDENTIALS', {})

    @property
    def valid_username(self):
        username = self.login_credentials.get('username')
        if not username:
            raise ValueError("Username no configurado en el archivo de configuración")
        return username

    @property
    def valid_password(self):
        password = self.login_credentials.get('password')
        if not password:
            raise ValueError("Password no configurado en el archivo de configuración")
        return password

    @property
    def images_url_prefix(self):
        return self.get('IMAGES_URL_PREFIX', 'imagen_externa')

    def __repr__(self):
        return f"Config(env='{self.env}')"

    def to_dict(self):
        return self.config_data.copy()

