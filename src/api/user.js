import request from '../utils/request'

export function register(params) {
    return request.post('/front/user/register', params);
}

export function login(params) {
    return request.post('/front/user/login', params);
}

export function submitFeedBack(params) {
    return request.post('/front/user/feedback', params);
}

export function comment(params) {
    return request.post('/front/user/comment',params);
}

export function deleteComment(id) {
    return request.delete(`/front/user/comment/${id}`);
}

export function updateComment(id,content) {
    return request.putForm(`/front/user/comment/${id}`,content);
}

export function getUserinfo() {
    return request.get('/front/user');
}

export function updateUserInfo(userInfo) {
    return request.put('/front/user',userInfo);
}

export function listComments(params) {
    return request.get('/front/user/comments', { params });
}

export function getBookshelfStatus(bookId) {
    return request.get('/front/user/bookshelf_status', { params: { bookId } });
}

export function addBookshelf(bookId) {
    return request.post('/front/user/bookshelf', null, { params: { bookId } });
}

export function listBookshelf(params) {
    return request.get('/front/user/bookshelf', { params });
}

export function removeBookshelf(bookId) {
    return request.delete(`/front/user/bookshelf/${bookId}`);
}

export function updateBookshelfReadProgress(bookId, preContentId) {
    return request.put(`/front/user/bookshelf/${bookId}/${preContentId}`);
}