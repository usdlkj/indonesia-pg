var check = (req, res, next) => {
  //   console.log(`Session Checker: ${req.session.id}`.green);
  if (req.session) {
    if (req.session.userId) {
      next();
    } else {
      res.status(403).json({ data: "Please relogin" });
    }
  } else {
    res.status(403).json({ data: "Please relogin" });
  }
};

module.exports = check;
