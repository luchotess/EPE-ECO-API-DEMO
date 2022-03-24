import 'dayjs/locale/es';
import dayjs                    from 'dayjs';
import { orderCreatedTemplate } from '../email/order-created.email';
import { PaymentMethodsDto }    from '../payment-methods/payment-methods.dto';
import { PaymentMethods }    from '../payment-methods/payment-methods.model';

let PaymentMethodsModel = new PaymentMethodsDto(PaymentMethods);

dayjs.locale('es');

const aws = require('aws-sdk');
const ses = new aws.SES({ region: 'us-east-1' });

import { Middleware }                               from '../Middleware';
import { HttpSucceedResponse, HttpFailureResponse } from '../utils';
import { OrdersDto }                                from './ordersDto';
import { Orders }                            from './orders.model';
import {sendOrderCreateEmail, bundleEmail, sendOrderStatusEmail} from '../email/bundleEmail';

let OrdersModel = new OrdersDto(Orders);

export async function getOrdersFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        const Orders = await OrdersModel.findAll({ propertyId: lambda.event.params.propertyId });
        lambda.context.succeed(HttpSucceedResponse(Orders));
    });
}

export async function getUserOrdersFunction (event, context) {
    return new Middleware().run(event, context).then(async lambda => {
        const Orders = await OrdersModel.findAll({
            propertyId: lambda.event.params.propertyId,
            user      : lambda.event.params.userId
        });
        lambda.context.succeed(HttpSucceedResponse(Orders));
    });
}

export async function changeOrderStatusFunction (event, context) {
    return new Middleware().run(event, context).then(async lambda => {
        const Order = await OrdersModel.findOne({
            _id: lambda.event.params.id
        });

        Order.status = lambda.event.body.newStatus;

        const OrderSaved = await Order.save();

       // console.log('OrderSaved' + OrderSaved)
        if (OrderSaved && await sendOrderStatusEmail(OrderSaved.shippingAddress, OrderSaved.storeName, OrderSaved.status, OrderSaved)){
            console.log('enviando Correo')
            lambda.context.succeed(HttpSucceedResponse(OrderSaved));
        }
    });
}

export async function createOrdersFunction (event, context) {
    return new Middleware().run(event, context).then(async lambda => {
        try {
            const newOrders = await OrdersModel.create({
                ...event.body,
                status    : 'Orden Recibida',
                datePlaced: new Date(),
                propertyId: lambda.event.params.propertyId
            });

            const savedOrder = await newOrders.save();

            const paymentMethod = await PaymentMethodsModel.findOne({ code: savedOrder.paymentMethod });

            const instructions = paymentMethod.instructions;

            if (savedOrder && paymentMethod) {
                const response = await sendOrderCreateEmail(event.body, instructions);

                if (response) {
                    console.log('email sent');
                    lambda.context.succeed(HttpSucceedResponse(savedOrder));
                }
            }
        } catch (err) {
            lambda.context.succeed(HttpFailureResponse('Error when creating a Orders.' + err, 400));
        }
    });
}

export async function updateOrdersFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin', 'admin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await OrdersModel.update(lambda.event.params.id, lambda.event.body)));
    });
}

export async function deleteOrdersFunction (event, context) {
    return new Middleware().run(event, context, ['superadmin']).then(async lambda => {
        lambda.context.succeed(HttpSucceedResponse(await OrdersModel.delete(lambda.event.params.id)));
    });
}
