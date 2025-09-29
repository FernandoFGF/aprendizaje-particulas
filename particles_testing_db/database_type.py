from enum import Enum


class DatabaseType(Enum):
    TESTING = "testing"
    LEARNING = "learning"

    @classmethod
    def get_all_types(cls):
        return [member.value for member in cls]

    @classmethod
    def is_valid_type(cls, db_type):
        return db_type in cls.get_all_types()