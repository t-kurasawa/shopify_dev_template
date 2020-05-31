const awsConfiguration = {
    Region: process.env.REACT_APP_COGNITO_REGION,
    UserPoolId: process.env.REACT_APP_COGNITO_USERPOOLID,
    ClientId: process.env.REACT_APP_COGNITO_CLIENTID,
    IdentityPoolId: process.env.REACT_APP_COGNITO_IDENTITYPOOLID
}

export default awsConfiguration