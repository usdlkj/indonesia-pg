var check = (req, res, next) => {
  if (req.session) {
    if (req.session.userId) {
      next();
    } else {
      res.redirect("/auth/login");
    }
  } else {
    res.redirect("/auth/login");
  }
};
module.exports = check;
