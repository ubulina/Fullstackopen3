const mongoose = require('mongoose')

const password = process.argv[2]

const name = process.argv[3]

const number = process.argv[4]

//määritellään skeema
const personSchema = new mongoose.Schema({
    name: String,
    number: String, 
})

//määritellään skeemaa vastaava model    
const Person = mongoose.model('Person', personSchema)


if(process.argv.length===3){

    const url =

    `mongodb+srv://ullkok:${password}@cluster0.vxncy.mongodb.net/phonebook?retryWrites=true&w=majority`

    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

    console.log(`phonebook: `)

    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })

}


if(process.argv.length===5){
   
    const url =

    `mongodb+srv://ullkok:${password}@cluster0.vxncy.mongodb.net/phonebook?retryWrites=true&w=majority`

    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

    //luodaan modelin avulla person-olio
    const person = new Person({
        name: name,
        number: number,
    })

    //talletetaan olio tietokantaan
    person.save().then(result => {
        console.log(`added ${name} number ${number} to phonebook`)
        mongoose.connection.close()

    })

}

