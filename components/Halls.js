class Halls {
    constructor(id, name, imageUrl, location, phoneNumber, services,userId) {
        this.id = id;
        this.name = name;
        this.imageUrl = imageUrl;
        this.location = location;
        this.phoneNumber = phoneNumber;
        this.services = services;
        this.userId = userId;
        // this.date = new Date(date).toISOString();
        // this.time = new Date(`${date}T${time}`).toISOString();
    }


    toPlainObject() {
        return {
            id: this.id,
            name: this.name,
            imageUrl: this.imageUrl,
            location: this.location,
            phoneNumber: this.phoneNumber,
            services: this.services,
            date: this.date,
            time: this.time,
        };
    }
}

export default Halls;
