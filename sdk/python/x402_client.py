import requests

class X402Client:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")

    def supported(self):
        r = requests.get(f"{self.base_url}/supported")
        r.raise_for_status()
        return r.json()

    def price(self, quote: dict):
        r = requests.post(f"{self.base_url}/price", json=quote)
        if r.status_code != 402:
            raise RuntimeError(f"expected 402, got {r.status_code}")
        return r.json()

    def verify(self, payload: dict):
        r = requests.post(f"{self.base_url}/verify", json=payload)
        r.raise_for_status()
        return r.json()

    def verify_settlement(self, payload: dict):
        r = requests.post(f"{self.base_url}/verify-settlement", json=payload)
        r.raise_for_status()
        return r.json()

    def attest(self, att: dict):
        r = requests.post(f"{self.base_url}/attest", json=att)
        r.raise_for_status()
        return r.json()
