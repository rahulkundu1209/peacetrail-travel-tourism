import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const ZOHO_OATHTOKEN = process.env.ZOHO_OATHTOKEN;
const GAS_DATA_URL = process.env.GAS_DATA_URL;
// Generate and send the invoice to user's email
const getCustomerId = async (customerDetails) => {
  if (!customerDetails.email) {
    return { status: "fail", message: "Email absent." };
  }

  try {
    // Check if a contact with the email already present, if yes return the contact id
    const getContactOptions = {
      headers: {
        "X-com-zoho-invoice-organizationid": "906926183",
        Authorization: `Zoho-oauthtoken ${ZOHO_OATHTOKEN}`,
      },
    };

    const getCustomerResponse = await axios.get(
      "https://www.zohoapis.com/invoice/v3/contacts",
      getContactOptions
    );
    // console.log(getCustomerResponse.data.contacts);
    const existingContact = getCustomerResponse.data.contacts.find(
      (contact) => contact.email === customerDetails.email
    );
    if (existingContact) {
      console.log("Old Customer Contact id", existingContact.contact_id);
      return existingContact.contact_id;
    }

    // If a contact with the email is not present then create a new contact and return the contact id
    if (
      !customerDetails.name ||
      !customerDetails.email ||
      !customerDetails.phone
    ) {
      return { status: "fail", message: "Ivalid New Customer Detail." };
    }
    const createContactOptions = {
      headers: {
        "X-com-zoho-invoice-organizationid": "906926183",
        Authorization: `Zoho-oauthtoken ${ZOHO_OATHTOKEN}`,
        "content-type": "application/json",
      },
    };
    const createCustomerRes = await axios.post(
      "https://www.zohoapis.com/invoice/v3/contacts",
      {
        contact_name: customerDetails.name,
        contact_persons: [
          {
            email: customerDetails.email,
            phone: customerDetails.phone,
            is_primary_contact: true,
          },
        ],
      },
      createContactOptions
    );
    console.log(
      "New Customer Contact Id:",
      createCustomerRes.contact.contactId
    );
    return createCustomerRes.contact.contact_id;
  } catch (error) {
    console.log(error.message);
    return 0;
  }
};

const sendInvoice = async (customerId, bookingDetails) => {
  const invoice_body = {
    customer_id: customerId,
    date: new Date().toISOString().split("T")[0],
    line_items: [
      {
        item_id: bookingDetails.packageId,
        name: `${bookingDetails.packageTitle} Date: ${bookingDetails.tourDate}`,
        rate: bookingDetails.price,
        quantity: bookingDetails.persons,
      },
    ],
  };

  const options = {
    headers: {
      "X-com-zoho-invoice-organizationid": "906926183",
      Authorization: `Zoho-oauthtoken ${ZOHO_OATHTOKEN}`,
      "content-type": "application/json",
    },
  };

  try {
    const createInvoiceResponse = await axios.post(
      "https://www.zohoapis.com/invoice/v3/invoices",
      invoice_body,
      options
    );
    // console.log("createInvoiceResponse", createInvoiceResponse.data);
    const invoiceId = createInvoiceResponse.data.invoice.invoice_id;

    const sendInvoiceBody = {
      send_from_org_email_id: true,
      to_mail_ids: [bookingDetails.email],
      cc_mail_ids: ["rk1209.work@gmail.com"],
      subject: `Invoice from Maa Jashoda Enterprise for Booking: ${bookingDetails.packageTitle}`,
      body: "Dear Customer, Thank You for Booking!",
    };

    const sendInvoiceResponse = await axios.post(
      `https://www.zohoapis.com/invoice/v3/invoices/${invoiceId}/email`,
      sendInvoiceBody,
      options
    );

    console.log(sendInvoiceResponse.data);

    return invoiceId;
  } catch (error) {
    console.error("error", error);
    return 0;
  }
};

const saveBooking = async (invoiceId = "0000000000", bookingDetails) => {
  try {
    const booking_body = {
      action: "saveBooking",
      id: invoiceId,
      package_id: bookingDetails.packageId,
      email: bookingDetails.email,
      start_date: bookingDetails.tourDate,
    };
    const sheetResponse = await axios.post(GAS_DATA_URL, booking_body);
    if(sheetResponse.data.success == true){
      return {status: "success", message: "Booking Saved."}
    }
    console.log(sheetResponse.data);
  } catch (error) {
    console.log(error);
    return { status: "fail", message: "Can't save in Google Sheet." };
  }
};

const bookPackage = async (bookingDetails) => {
  if (!bookingDetails.name || !bookingDetails.email || !bookingDetails.phone) {
    return { status: "fail", message: "Invalid Customer Details" };
  }
  const customerId = await getCustomerId({
    name: bookingDetails.name,
    email: bookingDetails.email,
    phone: bookingDetails.phone,
  });
  console.log("customerId", customerId);
  if (
    !bookingDetails.packageId ||
    !bookingDetails.packageTitle ||
    !bookingDetails.tourDate ||
    !bookingDetails.price ||
    !bookingDetails.persons
  ) {
    return { status: "fail", message: "Invalid Booking Details" };
  }
  const invoice = customerId != 0 ? await sendInvoice(customerId, bookingDetails) : null;
  const saveSts = await saveBooking(customerId, bookingDetails);

  console.log("invoice", invoice);
  console.log("saveSts", saveSts);
  return saveSts;
};

export { bookPackage };
