import { orderCreatedTemplate } from './order-created.email';
import { welcomeTemplate }      from './welcome.email';
import { OrderStatusTemplate } from "./orderStatus.email";

const aws = require('aws-sdk');
const ses = new aws.SES({region: 'us-east-1'});

export function bundleEmail (emailSettings, template, content) {
  return {
    Destination: {
      ToAddresses: emailSettings.toAddresses
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: template
        },
        Text: {
          Data: template
        }
      },

      Subject: {
        Data: ` ${content.storeName}: ${emailSettings.subject}`
      }
    },
    Source: `"${content.storeName}" <${emailSettings.fromTo}>`
  };
}

export const sendOrderCreateEmail = async (event, instructions) => {
  const emailSettings = {
    toAddresses: [event.shippingAddress.email],
    fromTo: 'sales@veetcuna.com',
    subject: '¡Gracias por tu compra!'
  };

  const content = {
    ...event,
    datePlaced: new Date(),
    instructions
  }

  const email = bundleEmail(emailSettings, orderCreatedTemplate(content), content);

  return await ses.sendEmail(email).promise();
}

export const sendWelcomeEmail = async (user, storeName) => {
  const emailSettings = {
    toAddresses: [user.email],
    fromTo: 'sales@veetcuna.com',
    subject: '¡Bievenido!'
  };

  const content = {
    user,
    storeName
  }

  const email = bundleEmail(emailSettings, welcomeTemplate(content), { storeName });

  return await ses.sendEmail(email).promise();
}

export const sendOrderStatusEmail  = async (shippingAddress, storeName, orderStatus, order) => {
  console.log(shippingAddress.email)

  const emailSettings = {
    toAddresses: [shippingAddress.email],
    fromTo: 'sales@veetcuna.com',
    subject: 'Estado de tu pedido',
  };

  const content = {
    orderStatus,
    shippingAddress,
    storeName
  }

  const email = bundleEmail(emailSettings, OrderStatusTemplate(content, order), { storeName });

  return await ses.sendEmail(email).promise();
}
