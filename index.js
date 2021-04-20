require('dotenv').config() //otetaan ympäristömuuttujat käyttöön
const express = require('express')//otetaan express käyttöön
const app = express() //luodaan express-sovellusta vastaava olio
const cors = require('cors') //sallitaan muista origineista tulevat pyynnöt cors-middlewarella
const Person = require('./models/person')//otetaan käyttöön person-moduuli ja asetetaan se muuttujaan
const { response } = require('express')


app.use(express.json())//json-parseri käyttöön
app.use(express.static('build')) //tarkistaa, löytyykö pyynnön polkua vastaavaa tiedostoa hakemistosta build
app.use(cors())

const morgan = require('morgan')
const { Mongoose } = require('mongoose')

//app.use(morgan('tiny'))

morgan.token('body', (request, response) => {
    return JSON.stringify(request.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


//middleware, joka tulostaa konsoliin palvelimelle tulevien pyyntöjen perustietoja
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}
  
app.use(requestLogger)



//INFOSIVU 
app.get('/info', (request, response, next) => {
    Person.countDocuments({}).then(count => {
        const date = Date().toString()
        response.send(`Phonebook has info for ${count} people <p> ${date} </p>`)
    })
    .catch(error => next(error))   
})



//HAKEE KAIKKI HENKILÖT TIETOKANNASTA
app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
    .catch(error => next(error))
    
})


//HAKEE YKSITTÄISEN HENKILÖN TIETOKANNASTA
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if(person) {
                response.json(person)
            } else {
                response.status(404).end()
            }        
        })
        .catch(error => next(error))
})    



//LISÄÄ UUDEN HENKILÖN TIETOKANTAAN
app.post('/api/persons', (request, response, next) => {

    const body = request.body

    console.log(body)

    if(!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    if(!body.number) {
        return response.status (400).json({
            error: 'number missing'
        })
    }

 
    //luodaan uusi henkilö-olio Person-konstruktorifunktiolla
    const person = new Person({
        //id: generateId(),
        name: body.name,
        number: body.number
    })

    //persons = persons.concat(person)
    
    //talletetaan henkilö tietokantaan
    //vastaanotettu data palautetaan pyynnön vastauksessa
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
    .catch(error => next(error))
    
})

//PÄIVITTÄÄ HENKILÖN UUDEN NUMERON TIETOKANTAAN
app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

//POISTAA YKSITTÄISEN HENKILÖN TIETOKANNASTA
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))    
})

//olemattomien osoitteiden käsittely
//määritellään ja otetaan käyttöön middleware, joka suoritetaan, jos mikään route ei käsittele http-pyyntöä
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
  
app.use(unknownEndpoint)


//määritellään virheidenkäsittelijä
const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if(error.name === 'CastError') {
        return response.status(400).send( { error: 'malformatted id'})
    }

    next(error)
}


//errorHandler-middleware otetaan käyttöön viimeisenä
app.use(errorHandler)

const PORT = process.env.PORT 
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
