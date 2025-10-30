import requests


class IdoruClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')

    def supported(self):
        return requests.get(f"{self.base_url}/supported").json()

    def price(self, quote: dict):
        return requests.post(f"{self.base_url}/price", json=quote).json()

    def verify(self, pid: str):
        return requests.post(f"{self.base_url}/verify", json={"pid": pid}).json()

    def attest(self, body: dict):
        return requests.post(f"{self.base_url}/attest", json=body).json()


