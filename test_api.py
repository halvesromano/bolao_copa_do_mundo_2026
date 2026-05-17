import requests

data = {
    "username": "testuser3",
    "email": "test3@test.com",
    "first_name": "Test",
    "last_name": "User",
    "password": "testpassword"
}

try:
    response = requests.post("http://localhost:8000/api/users/", json=data)
    print("STATUS:", response.status_code)
    print("RESPONSE:", response.text)
except Exception as e:
    print("ERROR:", e)
