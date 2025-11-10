const { Router } = require("express");
const cron = require("node-cron");

axios = require("axios")

const Parking = require("../models/Parking");
const Reservation = require("../models/Active_Reservation");
const User = require("../models/user")
const router = Router();

router.get("/admin", (req, res) => {
    return res.render("Admin");
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


// const reservationsCollection = db.collection('reservations')

// Find all reservations that have expired
// const expiredReservations = Reservation.find({
//     Leaving: { $lt: new Date() }
// });

// // Delete all expired reservations
// expiredReservations.deleteMany(err => {
//     if (err) throw err;
// })


router.get("/reservation", async (req, res) => {

    const reservation = await Reservation.find();
    console.log(new Date(Date.now()));
    return res.render("Reservation", { datas: reservation });
});

router.get('/reservation/:id', async (req, res) => {

    try {
        const { id } = req.params;
        const reservation = await Reservation.findByIdAndRemove(id);


        if (!reservation) {
            return res.status(404).json({ message: 'Not found' });
        }
        return res.redirect('back');
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
        return res.redirect('back');
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
        return res.redirect('back');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

})

// Admin Data


const date = new Date();

let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();

let currentDate = `${day}-${month}-${year}`;

router.get("/admin2", async (req, res) => {

    const user = await User.find()
    const parking = await Parking.find()
    const reservation = await Reservation.find()
    const numberStr = `${currentDate}`;

    // const search = req.query.search || "";
    const booking = await Reservation.findOne({ date: currentDate })

    return res.render("Admin2", {
        users: user,
        parkings: parking,
        reservations: reservation
    });

});




// Checking the active and marking the unActive Parking Resesrvations

// Run every minute
cron.schedule("*/1 * * * *", async () => {
    console.log("Checking for expired parking reservations...");

    const now = new Date();

    // Find all active reservations
    const reservations = await Reservation.find({ isActive: true });

    for (let reservation of reservations) {
        try {
            // Combine date and Leaving time into a full ISO string
            const leavingDateTime = new Date(`${reservation.date}T${reservation.Leaving}:00`);

            // Compare
            if (leavingDateTime < now) {
                reservation.isActive = false;
                await reservation.save();
                console.log(`Deactivated: ${reservation.Username} — left at ${reservation.Leaving}`);
            }
        } catch (err) {
            console.error("Error checking reservation:", err);
        }
    }
});



module.exports = router;