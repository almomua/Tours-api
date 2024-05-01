
const fs = require('fs');
const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);
exports.getAllUsers = (req, res) => {
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours: tours,
        },
    });
};
exports.getUser = (req, res) => {
    const id = +req.params.id;
    if (id > tours.length)
        return res.status(404).json({ status: 'fali', err: 'invalid id' });
    tour = tours.find((element) => element.id === id);
    res.status(200).json({ status: 'success', data: tour });
};
exports.createUser = (req, res) => {
    const newID = tours.at(-1).id + 1;
    const newTour = { id: newID, ...req.body };
    // console.log(newTour);
    tours.push(newTour);
    fs.writeFile(
        `./dev-data/data/tours-simple.json`,
        JSON.stringify(tours),
        (err) => {
            if (err)
                return res.status(400).json({ message: 'failure', err: err });
        }
    );
    res.status(201).json({ message: 'success', data: newTour });
}
exports.updateUser = (req, res) => {
    const id = +req.params.id;
    if (id > tours.length)
        return res.status(404).json({ status: 'fali', err: 'invalid id' });
    tour = tours.find((element) => element.id === id);
    tour = { ...tour, ...req.body };
    res.status(200).json({ status: 'success', data: tour });
};
exports.deleteUser = (req, res) => {
    const id = +req.params.id;
    if (id > tours.length)
        return res.status(404).json({ status: 'fali', err: 'invalid id' });
    tour = tours.find((element) => element.id === id);
    tours.splice(tours.indexOf(tour), 1);
    res.status(200).json({ status: 'success', data: tour });
};