
const TokenKey = 'Authorization'
const nickNameKey = 'nickName'
const uidKey = 'uid'

const AdminTokenKey = 'AdminAuthorization'
const AdminNickNameKey = 'adminNickName'
const AdminUidKey = 'adminUid'

export const getToken = () => {
    return localStorage.getItem(TokenKey);
}

export const setToken = (token) => {
  return localStorage.setItem(TokenKey, token)
}

export const removeToken = () =>  {
  return localStorage.removeItem(TokenKey)
}

export const removeNickName = () =>  {
  return localStorage.removeItem(nickNameKey)
}

export const setNickName = (nickName) => {
  return localStorage.setItem(nickNameKey, nickName)
}

export const getNickName = () => {
  return localStorage.getItem(nickNameKey);
}

export const setUid = (uid) => {
  return localStorage.setItem(uidKey, uid)
}

export const getUid = () => {
  return localStorage.getItem(uidKey);
}

export const removeUid = () =>  {
  return localStorage.removeItem(uidKey)
}

export const getAdminToken = () => {
    return localStorage.getItem(AdminTokenKey);
}

export const setAdminToken = (token) => {
  return localStorage.setItem(AdminTokenKey, token)
}

export const removeAdminToken = () => {
  return localStorage.removeItem(AdminTokenKey)
}

export const setAdminNickName = (nickName) => {
  return localStorage.setItem(AdminNickNameKey, nickName)
}

export const getAdminNickName = () => {
  return localStorage.getItem(AdminNickNameKey);
}

export const removeAdminNickName = () => {
  return localStorage.removeItem(AdminNickNameKey)
}

export const setAdminUid = (uid) => {
  return localStorage.setItem(AdminUidKey, uid)
}

export const getAdminUid = () => {
  return localStorage.getItem(AdminUidKey);
}

export const removeAdminUid = () => {
  return localStorage.removeItem(AdminUidKey)
}

