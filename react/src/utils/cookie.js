export function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export function deleteCookie(name) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

export function setCookie(name, token) {
  document.cookie = `${name}=${token}; path=/; max-age=10800; Secure`;
}
