import { Sequelize } from 'sequelize';
import { initModels, product, productCreationAttributes, order, orderCreationAttributes, orderdetail, orderdetailCreationAttributes } from "./models/init-models";
import * as dotenv from 'dotenv';
import { ApolloServer, gql } from 'apollo-server';
import { readFileSync } from 'fs';

const typeDefs = readFileSync("./src/product.graphql").toString('utf-8');
dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASS as string, {
    host: process.env.DB_HOST as string,
    dialect: 'mysql'
});

// import models into sequelize instance
initModels(sequelize);

const resolvers = {
    Query: {
        products: async () => await product.findAll(),
        orders: async () => await order.findAll()
    },


    Mutation: {
        GetDetailProduct: async (_parent: any, args: any) => {
            return await product.findByPk(args.id);
        },

        GetDetailOrder: async (_parent: any, args: any) => {
            return await orderdetail.findByPk(args.id)
        },

        CreateProduct: async (_parent: any, args: any) => {
            const now = new Date();
            const createdAt = now;
            createdAt.setDate(now.getDate());

            const newProduct: productCreationAttributes = {
                name: args.name,
                stock: args.stock,
                price: args.price,
                created: createdAt.toDateString()

            }
            return await product.create(newProduct);
        },
        CreateOrder: async (_parent: any, args: any) => {

            const newOrder: orderdetailCreationAttributes = {
                productid: args.productid,
                quantity: args.quantity,
                price: args.price,
                order_id: args.order_id

            }
            return await orderdetail.create(newOrder);
        },
        UpdateProduct: async (_parent: any, args: any) => {
            return await product.update({
                name: args.name,
                stock: args.stock,
                price: args.price,
            }, {
                where: {
                    id: args.id
                }
            })
        },
        DeleteProduct: async (_parent: any, args: any) => {
            return await product.destroy({
                where: {
                    id: args.id
                }
            })
        }
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});