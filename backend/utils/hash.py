from passlib.context import CryptContext

crypt = CryptContext(schemes = ["bcrypt"], deprecated = "auto")

class Hash():
    def bcrypt(secret: str):
        return crypt.hash(secret)

    def verify(secret: str, hash: str):
        return crypt.verify(secret, hash)
