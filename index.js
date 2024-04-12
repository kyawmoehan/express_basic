const express = require('express');
const { v4: uuid } = require('uuid');
const { z } = require('zod');

const app = express()
const port = 3000

app.use(express.json());

const shops = [
    {
        id: uuid(),
        title: 'Shoes',
        description: "Good product",
        price: 15000
    },
    {
        id: uuid(),
        title: 'T-shirt',
        description: "Good product",
        price: 7500
    },
    {
        id: uuid(),
        title: 'Bug',
        description: "Good product",
        price: 750
    },
];

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
    const newId = uuid();
    shops.push({ id: newId, ...req.body });
    res.json(req.body)
})

app.get('/shops', (req, res) => {
    res.json(shops);
})

app.get('/shops/:id', validateParamStringData(paramSchemaString), (req, res) => {
    const shop = shops.find(shop => shop.id == req.params.id);
    if (!shop) {
        res.status(404).json({
            message: 'Shop not found'
        });
    }
    res.json(shop);
})

app.put('/shops/:id', (req, res) => {
    const shopIndex = shops.findIndex(shop => shop.id == req.params.id);

    if (shopIndex === -1) {
        res.status(404).json({
            message: 'Shop not found'
        });
    }

    const shop = {
        id: req.params.id,
        ...req.body
    }
    shops[shopIndex] = shop;
    res.send(shop)
})

app.delete('/shops/:id', (req, res) => {
    const shopData = shops.filter(shop => shop.id !== req.params.id);
    if (!shopData) {
        res.status(404).json({
            message: 'Shop not found'
        });
    }

    res.send(shopData)
})

app.listen(port, () => {
    try {
        console.log(`Example app listening on port ${port}`)
    } catch (error) {
        return error;
    }
})