import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'

const createClient = () => {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) {
    return null
  }

  return new MercadoPagoConfig({
    accessToken,
    options: { timeout: 5000 }
  })
}

export const getPaymentClient = () => {
  const client = createClient()
  if (!client) {
    return null
  }

  return new Payment(client)
}

export const getPreferenceClient = () => {
  const client = createClient()
  if (!client) {
    return null
  }

  return new Preference(client)
}
