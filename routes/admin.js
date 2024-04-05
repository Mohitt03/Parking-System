const { Router } = require("express");

axios = require("axios")

const Parking = require("../models/Parking");
const Reservation = require("../models/Reservation");
const User = require("../models/user")
const router = Router();

router.get("/admin", (req, res) => {
    return res.render("Admin");
});

router.get("/admin2", (req, res) => {
    return res.render("Admin2");
});

router.get("/user-Profile", (req, res) => {
    return res.render("users-profile");
});

router.get("/pages-faq", (req, res) => {
    return res.render("pages-faq");
});

router.get("/pages-contact", (req, res) => {
    return res.render("pages-contact");
});

router.get("/pages-register", (req, res) => {
    return res.render("pages-register");
});

router.get("/pages-login", (req, res) => {
    return res.render("pages-login");
});

router.get("/pages-blank", (req, res) => {
    return res.render("pages-blank");
});


// Reservations

router.get("/reservation", async (req, res) => {
    const reservation = await Reservation.find()
    return res.render("Reservation", { datas: reservation });
});

router.get('/reservation/:id', async (req, res) => {

    try {
        const { id } = req.params;
        const reservation = await Reservation.findByIdAndRemove(id);


        if (!reservation) {
            return res.status(404).json({ message: 'Not found' });
        }
        return res.redirect("/admin/reservation")
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

})

// Users

router.get("/users", async (req, res) => {

    const user = await User.find()
    return res.render("users", { datas: user });
});


router.get('/users/:id', async (req, res) => {

    try {
        const { id } = req.params;
        const user = await User.findByIdAndRemove(id);


        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.redirect("/admin/users")
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

})

// Parking

router.get("/parking", async (req, res) => {

    const parking = await Parking.find()
    return res.render("Parking", { datas: parking });
});


// Creating Parking

router.get("/create", (req, res) => {

    return res.render("createparking", {
        heading: "New Parking",
        submit: "Create"
    });
});

router.post("/create", async (req, res) => {


    const parking = await Parking.create(req.body)
    res.redirect("/admin/parking");
})

// Updating Parking

router.get("/edit/:id", async (req, res) => {

    try {
        const { id } = req.params;
        const parking = await Parking.findById(id);

        return res.render("createparking", {
            heading: "Edit Parking",
            submit: "Update",
            parking
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});


router.post('/edit/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const parking = await Parking.findByIdAndUpdate(id, req.body);
        res.redirect("/admin/parking");

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Parking Delete

router.get('/parking/:id', async (req, res) => {

    try {
        const { id } = req.params;
        const parking = await Parking.findByIdAndRemove(id);


        if (!parking) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.redirect("/admin/parking")
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

})


module.exports = router;
