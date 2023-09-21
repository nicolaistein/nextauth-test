// This is an example of how to read a JSON Web Token from an API route
import { getToken } from "next-auth/jwt"
import Corbado from '@corbado/node-sdk';
import type { NextApiRequest, NextApiResponse } from "next"


const projectID = process.env.PROJECT_ID;
const apiSecret = process.env.API_SECRET;
const config = new Corbado.Configuration(projectID, apiSecret);
const corbado = new Corbado.SDK(config);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
 
    const {loginIdentifier, loginIdentifierType} = req.body;
    const clientInfo = corbado.utils.getClientInfo(req);

    try {
        // use the Corbado SDK to create the association token
        // see https://api.corbado.com/docs/api/#tag/Association-Tokens/operation/AssociationTokenCreate) for details
        const associationToken = await corbado.associationTokens.create(loginIdentifier, loginIdentifierType, clientInfo);

        if (associationToken?.data?.token) {
            return res.status(200).send(associationToken.data.token);
        } else {
            return res.status(500).send({error: 'Association token creation unsuccessful'});
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({error: 'An error occurred while creating the association token'});
    }
}
