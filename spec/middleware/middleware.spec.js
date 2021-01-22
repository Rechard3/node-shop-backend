const express = require("express");
const middleware = require("../../middleware/middleware");


describe("Generic Middleware", function(){
    /** @type {import("express").Express} */
    let app;
    beforeEach(()=>{
        app = express();
    });
    afterEach(()=>{
    });


    it("should register an express session", function(){
        const spy = spyOn(app, "use").and.stub(()=>app).and.returnValue(app);
        middleware.registerAppMiddleware(app);
        expect(spy).toHaveBeenCalled();
    });
});