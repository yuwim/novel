import request from '../utils/request'

export function adminLogin(params) {
    return request.post('/admin/login', params);
}

export function getUserCount() {
    return request.get('/admin/user/count');
}

export function getBookCount() {
    return request.get('/admin/book/count');
}

export function getTodayVisit() {
    return request.get('/admin/visit/today');
}

export function getDashboardStats() {
    return request.get('/front/home/books');
}

export function listBooks(params) {
    return request.get('/front/search/books', { params });
}

export function getBookById(bookId) {
    return request.get(`/front/book/${bookId}`);
}

export function listLatestComments(params) {
    return request.get('/front/book/comment/newest_list', { params });
}

export function listVisitRankBooks() {
    return request.get('/front/book/visit_rank');
}

export function listNewestRankBooks() {
    return request.get('/front/book/newest_rank');
}

export function listUpdateRankBooks() {
    return request.get('/front/book/update_rank');
}

export function searchBooks(params) {
    return request.get('/front/search/books', { params });
}

export function listCategorys() {
    return request.get('/front/book/category/list');
}

export function updateBookStatus(params) {
    return request.put('/admin/book/status', params);
}

export function deleteBook(bookId) {
    return request.delete(`/admin/book/${bookId}`);
}

export function listBookAudits(params) {
    return request.get('/admin/audit/books', { params });
}

export function listChapterAudits(params) {
    return request.get('/admin/audit/chapters', { params });
}

export function auditBook(params) {
    return request.post('/admin/audit/book', params);
}

export function auditChapter(params) {
    return request.post('/admin/audit/chapter', params);
}

export function updateBook(bookId, params) {
    return request.put(`/admin/book/${bookId}`, params);
}

export function listUsers(params) {
    return request.get('/admin/users', { params });
}

export function listAllComments(params) {
    return request.get('/admin/comment/list', { params });
}

export function auditComment(params) {
    return request.post('/admin/comment/audit', params);
}

export function deleteComment(commentId) {
    return request.delete(`/admin/comment/${commentId}`);
}
