var create = {
    type: "array",
    id: "/create",
    items: {
      properties: {
        material_id: { type: "string" },
        app_qty: { type: "number" },
        reject_qty: { type: "number" },
        lost_qty: { type: "number" },
        remarks: { type: "string" },
      },
      required: ["material_id", "app_qty", "reject_qty", "lost_qty"],
    },
  };


  var edit = {
    type: "array",
    id: "/edit",
    items: {
      properties: {
        material_id: { type: "string" },
        app_qty: { type: "number" },
        reject_qty: { type: "number" },
        lost_qty: { type: "number" },
        remarks: { type: "string" },
      },
      required: ["material_id", "app_qty", "reject_qty", "lost_qty"],
    },
  };


  module.exports = { create, edit };

  /* 
  example for use in controller

  var schema = require("../validation/example");

var Validator = require("jsonschema").Validator;

  var check = v.validate(req.body, schema.create);
  if (check.errors.length > 0) {
    error handler in here
  }else{
    next code in here
  }
  
  */