module.exports = function (req, res, next) {
    if (!req.session.user) {
      // req.flash("danger", "You need to login first");
      res.locals.user = false;
      
      return res.redirect("/admin/login");
    }
    else{
      res.locals.user = true;
    }
    next();
  };
  