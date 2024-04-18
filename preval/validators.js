function checkAuth(request, reply, next) {
  if(request.isAuthenticated()) {
    next();
  } else {
    return reply.redirect('/login');
  }
}

function checkNotAuth(request, reply, next) {
  if (request.isAuthenticated()) {
    return reply.redirect('/');
  } else {
    next();
  }
}

module.exports = { checkNotAuth, checkAuth };