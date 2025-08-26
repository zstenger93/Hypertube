import requests

url = "http://localhost"
token = ""
user_id = 1
#result = requests.get(f"{url}/movies", cookies=cookie)

def check_language():
    payload = {"language": "EN"}
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    response = requests.patch(f"{url}/users/{user_id}", json=payload, headers=headers)
    if response.ok:
        print("Success:", response.json())
    else:
        print("Error:", response.status_code, response.text)


def check_movies0():
    response = requests.get(f"{url}/movies/")
    if response.ok:
        print("Success:", response.json())
    else:
        print("Error:", response.status_code, response.text)

def check_movies1():
    response = requests.get(f"{url}/movies/?page=1")
    if response.ok:
        print("Success:", response.json())
    else:
        print("Error:", response.status_code, response.text)


def check_movies2():
    response = requests.get(f"{url}/movies/a?page=1")
    if response.ok:
        print("Success:", response.json())
    else:
        print("Error:", response.status_code, response.text)


def check_movies3():
    response = requests.get(f"{url}/movies/marvel?page=1")
    if response.ok:
        print("Success:", response.json())
    else:
        print("Error:", response.status_code, response.text)


def check_comments0():
    response = requests.get(f"{url}/comments")
    if response.ok:
        print("Success:", response.json())
    else:
        print("Error:", response.status_code, response.text)

def check_comments1():
    movie_id = "tt10857164"
    response = requests.get(f"{url}/comments/{movie_id}")
    if response.ok:
        print("Success:", response.json())
    else:
        print("Error:", response.status_code, response.text)


def check_user():
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    response = requests.patch(f"{url}/users/1", headers=headers)
    if response.ok:
        print("Success:", response.json())
    else:
        print("Error:", response.status_code, response.text)


print("Movies Test 0")
check_movies0()
print("Movies Test 1")
check_movies1()
print("Movies Test 2")
check_movies2()
print("Movies Test 3")
check_movies3()
print("Comments Test 0")
check_comments0()
print("Comments Test 1")
check_comments1()


if token != "":
    print("Change Language")
    check_language()
    print("Check Users")
    check_user()



