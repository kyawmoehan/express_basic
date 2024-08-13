const express = require('express');
const { v4: uuid } = require('uuid');
const { z } = require('zod');
const { Sequelize, DataTypes } = require('sequelize');

const app = express()
const port = 3000

app.use(express.json());

// database 
const sequelize = new Sequelize(
    'testing',
    'kyaw',
    'node_kyaw',
    {
        host: "mysql_server",
        dialect: 'mysql'
    }
);

const Shop = sequelize.define('shops', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

sequelize.authenticate().then(() => {
    console.log('Database connection successfully!');
}).catch(error => {
    console.log('Database connection error', error);
});

sequelize.sync().then(() => {
    console.log('Sync tables')
}).catch(error => {
    console.log('Sync tables error', error)
})

// validation
const shopSchema = z.object({
    title: z.string({
        required_error: 'Title is required'
    }),
    description: z.string().optional(),
    price: z.number({
        required_error: 'Price is required'
    })
});

const paramSchemaNumber = z.object({
    id: z.number()
});

const paramSchemaString = z.object({
    id: z.string()
})

const validateBodyData = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error) {
                const errorMessages = error.errors.map((issue) => ({
                    message: `${issue.path.join('.')} is ${issue.message}`,
                }))
                res.status(400).json({ error: 'Invalid data', details: errorMessages });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    };
}

const validateParamNumberData = (schema) => {
    return (req, res, next) => {
        try {
            const id = +req.params.id;
            schema.parse({ id });
            next();
        } catch (error) {
            if (error) {
                const errorMessages = error.errors.map((issue) => ({
                    message: `${issue.path.join('.')} is ${issue.message}`,
                }))
                res.status(400).json({ error: 'Invalid data', details: errorMessages });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    };
}

const validateParamStringData = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.params);
            next();
        } catch (error) {
            if (error) {
                const errorMessages = error.errors.map((issue) => ({
                    message: `${issue.path.join('.')} is ${issue.message}`,
                }))
                res.status(400).json({ error: 'Invalid data', details: errorMessages });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    };
}

// routes
app.post('/shops', validateBodyData(shopSchema), (req, res) => {
    const { title, description, price } = req.body;
    console.log(title, description, price);
    Shop.create({
        title: title,
        description: description,
        price: price,
    }).then((shop) => {
        res.json(shop)
    }).catch(error => {
        console.log(error);
    })
})

app.get('/shops', (req, res) => {
    Shop.findAll().then((shops) => {
        res.json(shops);
    }).catch(error => {
        console.log(error);
    })
})

app.get('/shops/:id', validateParamStringData(paramSchemaString), (req, res) => {
    Shop.findOne({
        where: {
            id: req.params.id
        }
    }).then(shop => {
        if (!shop) {
            res.json({
                message: 'Not found!'
            });
        } else {
            res.json(shop);
        }
    }).catch(error => {
        console.log(error);
    })
})

app.put('/shops/:id', (req, res) => {
    const { title, description, price } = req.body;
    Shop.update(
        {
            title: title,
            description: description,
            price: price
        },
        {
            where: {
                id: req.params.id
            }
        }
    ).then(shop => {
        console.log(shop);
        res.json(shop);
    }).catch(error => {
        console.log(error);
    })
})

app.delete('/shops/:id', (req, res) => {
    Shop.destroy({
        where: {
            id: req.params.id
        }
    }).then(shop => {
        console.log(shop);
        if (shop === 0) {
            res.json({
                message: 'Not found'
            })
        }
        res.json({
            message: `Delete shop ${req.params.id}`
        });
    }).catch(error => {
        console.log(error);
    })
})


// listen
app.listen(port, () => {
    try {
        console.log(`Example app listening on port ${port}`)
    } catch (error) {
        return error;
    }
})