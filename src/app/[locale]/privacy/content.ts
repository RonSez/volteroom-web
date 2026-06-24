// Privacy policy content. English source, shown on all locales for now.
// Structured into sections of typed blocks so the page can render consistent prose.

export type Block =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "lines"; items: string[] }
  | { type: "dl"; items: { term: string; def: string }[] };

export type PrivacySection = {
  heading?: string;
  blocks: Block[];
};

export const privacyTitle = "Personal data protection";

export const privacySections: PrivacySection[] = [
  {
    blocks: [
      {
        type: "p",
        text: "The proper processing of your personal data is very important to us and its protection is a matter of course for us, therefore we would like to provide you with detailed information, in particular, on why we process your personal data, what reasons we have for doing so, what rights you have in connection with the processing of personal data, as well as other information that may interest you.",
      },
      {
        type: "p",
        text: "We would like to assure you that we adhere to strict rules that stipulate who has access to your personal data and what personal data may be processed. We do not provide your personal data outside the operator VOLTEROOM, s.r.o., except in cases where you wish to transfer your personal data to another operator, when we have your consent to do so and in cases where a legal regulation requires or authorizes us to do so or if it is our legitimate interest.",
      },
      {
        type: "p",
        text: "Please read the information below on the processing of personal data, which we have designed to make this document as clear and practical as possible for you.",
      },
      {
        type: "p",
        text: "If after reading this document anything is unclear or you are unsure about something, we will be happy to explain any term or part of this document to you. In these cases, you can contact us in writing at the e-mail address info@volteroom.com or at VOLTEROOM, s.r.o., Znievska 3060/8, 851 06 Bratislava-Petržalka.",
      },
    ],
  },
  {
    heading: "1. Who is the controller of your personal data?",
    blocks: [
      {
        type: "p",
        text: "The controller of personal data is always the person to whom the personal data were provided and who determines the purpose and means of processing personal data.",
      },
      {
        type: "p",
        text: "The controller of personal data is VOLTEROOM, s.r.o., Znievska 3060/8, 851 06 Bratislava-Petržalka, registered in the Commercial Register of the Bratislava I District Court, section Sro, vl. no. 199037/B, IČO: 57 558 351 (hereinafter referred to as “VOLTEROOM”).",
      },
      {
        type: "p",
        text: "You can exercise your rights in writing by post or e-mail to the following contacts:",
      },
      {
        type: "lines",
        items: [
          "Contact: VOLTEROOM, s.r.o.",
          "Address: Znievska 3060/8, 851 06 Bratislava-Petržalka",
          "Email: info@volteroom.com",
        ],
      },
    ],
  },
  {
    heading:
      "2. What is the processing of personal data and what terms are associated with processing?",
    blocks: [
      {
        type: "p",
        text: "First of all, we would like to introduce you to the basic terms used in this document, which will help you better understand this document.",
      },
      {
        type: "dl",
        items: [
          {
            term: "Personal data",
            def: "any information relating to an identified or identifiable natural person, such as name, surname, date of birth, social security number, telephone number, email address, IP address, etc.",
          },
          {
            term: "Data subject",
            def: "a natural person to whom the personal data relate.",
          },
          {
            term: "Processing of personal data",
            def: "an activity that a controller or processor carries out with personal data.",
          },
          {
            term: "Controller",
            def: "a natural person or legal person who determines the purposes and means of processing personal data; the controller may entrust the processing to a processor.",
          },
          {
            term: "Processor",
            def: "a natural person or legal person, public authority, agency or other entity that processes personal data for the controller on its behalf.",
          },
          {
            term: "Responsible person",
            def: "a natural or legal person designated by the controller or processor to carry out activities related to the protection of personal data.",
          },
          {
            term: "Purpose",
            def: "the reason why the controller processes personal data.",
          },
          {
            term: "Special categories of personal data",
            def: "sensitive personal data that has a specific nature, such as health data or biometric data enabling the identification of a person.",
          },
          {
            term: "Legitimate interest",
            def: "the interest of the controller or another entity, from which the need to process personal data arises, if it prevails over the interests of the data subject, for example, when the data subject is a customer of the controller.",
          },
          {
            term: "Profiling",
            def: "any automated processing of personal data that is used to evaluate specific personal conditions, such as behavior on the Internet and when making online purchases.",
          },
          {
            term: "Cookies",
            def: "small data files that are stored in a special browser cache on the user's computer and are necessary for some functions of websites, such as logging in and are often also used to track user behavior on the website. Their use can be prohibited in most Internet browsers.",
          },
          {
            term: "Recipient",
            def: "a natural person, legal entity, public authority or other entity to whom personal data is provided.",
          },
          {
            term: "Product",
            def: "any products offered on our website.",
          },
          {
            term: "Service",
            def: "any of the services we offer you, i.e. our products and services offered online and their support.",
          },
        ],
      },
    ],
  },
  {
    heading: "3. What personal data do we process?",
    blocks: [
      {
        type: "p",
        text: "We only process such personal data so that we can sell you our products and provide our services and customer support, to comply with our legal obligations, and also to protect our legitimate interests.",
      },
      {
        type: "p",
        text: "We process in particular the following categories of personal data:",
      },
      { type: "h3", text: "Basic identification data" },
      {
        type: "p",
        text: "We need basic identification data for the purposes of the contract you conclude with us. This includes your name, surname, billing address and delivery address.",
      },
      { type: "h3", text: "Contact data" },
      {
        type: "p",
        text: "Contact data includes your e-mail and telephone number.",
      },
      { type: "h3", text: "Information about the use of our services" },
      {
        type: "p",
        text: "This information includes information about the services you use with us, and based on this information we can recommend other suitable products to you.",
      },
      { type: "h3", text: "Information about interactions with you" },
      {
        type: "p",
        text: "We record information about interactions with you in writing so that we can provide you with adequate customer support.",
      },
      { type: "h3", text: "Transactional data" },
      {
        type: "p",
        text: "This is exclusively information about payments for our products.",
      },
    ],
  },
  {
    heading: "4. For what purposes do we process personal data?",
    blocks: [
      { type: "p", text: "We process personal data:" },
      { type: "ul", items: ["without your consent,", "with your consent"] },
      { type: "h3", text: "Processing of personal data without your consent" },
      { type: "h3", text: "Processing based on a contract" },
      {
        type: "p",
        text: "We process your personal data for the purpose of concluding a contract between you, as our customer and potential customer, and us, as a supplier, when using our services. In such a case, personal data is processed only to the extent necessary for concluding and fulfilling the relevant contract. This mainly concerns the fulfillment of the subject matter of the contract, customer support, contract administration and registration of participants.",
      },
      {
        type: "p",
        text: "For this purpose, the provision of your personal data is completely voluntary, but it is necessary for concluding the contract and its subsequent administration. Without this data, we would not be able to conclude the contract with you and fulfill the obligations and rights arising from it.",
      },
      { type: "h3", text: "Processing based on legitimate interests" },
      { type: "p", text: "The legitimate interest of VOLTEROOM is:" },
      {
        type: "ul",
        items: [
          "to inform you about news related to the administration of your contract,",
          "to inform you about VOLTEROOM services and products by e-mail via the Newsletter,",
          "to defend legal claims.",
        ],
      },
      { type: "h3", text: "Processing for statistical purposes" },
      {
        type: "p",
        text: "After the termination of your contract and the expiry of the period for which we store personal data, personal data is further processed for statistical purposes in an anonymized form.",
      },
      { type: "h3", text: "Cookies" },
      { type: "p", text: "Our websites use cookies that:" },
      {
        type: "ul",
        items: [
          "improve the performance of websites by collecting information about the way visitors use them (e.g. which tabs are visited most often),",
          "increase the functionality of websites and bring them closer to you by allowing us to remember your previous choices. However, this information is not used to identify you or remember where you have been on the Internet,",
          "it enables some tools to work, provides anti-spam measures and also access to age-restricted content,",
          "it enables some of our suppliers to provide services that they provide on our behalf in relation to the website.",
        ],
      },
      {
        type: "p",
        text: "Using cookies, we can also record statistical data on the behavior of visitors to these websites in general. Thanks to this, we can tailor them to your interests and requirements.",
      },
      {
        type: "p",
        text: "Cookies help us identify particularly popular or problematic parts of the website, but they cannot be linked to a specific user. We also use cookies for the purposes of your authentication, i.e. to eliminate the need to enter identification data about you each time you access the website. At the same time, we also use them to customize the website to your needs, e.g. in order to continue to display the website in your chosen language or in a certain graphic design.",
      },
      {
        type: "p",
        text: 'You can of course also view these websites without cookies. However, it is possible that some of their functionalities will be limited and the comfort of use will be reduced. Most browsers automatically accept these files, but their storage can be prevented by selecting the "do not accept cookies" option in the browser settings. You can also delete cookies that have already been stored on your device at any time. You can find out the exact settings of this function using the "settings" of your browser.',
      },
      { type: "h3", text: "Processing of personal data with your consent" },
      { type: "h3", text: "Processing for marketing purposes" },
      {
        type: "p",
        text: "We also process your personal data for marketing purposes, and unless you are our customer, we have your consent for this purpose.",
      },
      {
        type: "p",
        text: "Marketing includes the offer of products and services of VOLTEROOM. We send you offers by e-mail via Newsletter based on your consent.",
      },
      {
        type: "p",
        text: "The consent provided for marketing purposes is completely voluntary, but it is necessary in order for us to be able to send you individual offers of VOLTEROOM services. Without such consent, we cannot provide you with individual offers of services.",
      },
      {
        type: "h3",
        text: "Processing of customer photos for the purpose of promoting VOLTEROOM activities",
      },
      {
        type: "p",
        text: "We publish your photos from participation in VOLTEROOM events organized for customers on the VOLTEROOM Facebook page only with your consent, which you can grant us directly at a specific event. You can revoke your consent at any time, even partially, at VOLTEROOM, in writing by post or e-mail at the contacts:",
      },
      {
        type: "lines",
        items: [
          "Contact: VOLTEROOM, s. r. o.",
          "Address: Znievska 3060/8, 851 06 Bratislava-Petržalka",
          "E-mail: info@volteroom.com",
        ],
      },
    ],
  },
  {
    heading: "5. How long do we store your personal data?",
    blocks: [
      {
        type: "p",
        text: "We store your personal data for the duration of your contract in order to provide you with our services. After the termination of the contractual relationship and the settlement of all obligations arising from or related to the contract, we store your personal data for the necessary time, namely for a period of up to 10 years, which is required by the relevant legal regulations.",
      },
      {
        type: "p",
        text: "The period of storage of personal data results mainly from Act No. 431/2002 Coll. on Accounting, as amended, and Act No. 40/1964 Coll. on the Civil Code, as amended.",
      },
      {
        type: "p",
        text: "We store/publish personal data processed on the basis of your consent for a period of 5 years from their acquisition/disclosure, or until you revoke this consent.",
      },
    ],
  },
  {
    heading: "6. Where do we obtain personal data from?",
    blocks: [
      { type: "p", text: "We collect personal data:" },
      {
        type: "ul",
        items: [
          "directly from you when concluding and during the term of the contract and when fulfilling the contract,",
          "directly from you when filling out the contact form on our website,",
          "directly from you when registering online for our Newsletter,",
          "directly at an event organized by VOLTEROOM for customers,",
          "from other persons to whom you have given consent.",
        ],
      },
    ],
  },
  {
    heading: "7. How can you withdraw your consent to the processing of personal data?",
    blocks: [
      {
        type: "p",
        text: "Consent to the processing of personal data for marketing purposes is based on the principle of voluntariness. This means that you can withdraw it at any time. Do you no longer want to receive any offers of VOLTEROOM products (Newsletter)? We are sorry, but we fully respect your decision.",
      },
      { type: "h3", text: "What should the withdrawal of consent contain?" },
      {
        type: "p",
        text: "Who is submitting the withdrawal. Please provide your first name, last name and e-mail.",
      },
      {
        type: "p",
        text: "State explicitly that you do not want us to continue processing your personal data for marketing purposes. You can revoke your consent generally (it will apply to all marketing activities), or specify which marketing activities the revocation applies to (sending the Newsletter).",
      },
      { type: "p", text: "Address the revocation to VOLTEROOM." },
      { type: "h3", text: "How can you send your revocation?" },
      {
        type: "p",
        text: "You can send your revocation by post or e-mail. For service offers sent by e-mail (Newsletter), you can revoke your consent online directly in the text of this e-mail by clicking on the link that allows you to revoke your consent to the sending of these e-mails. In this case, your e-mail will be automatically deleted from our database.",
      },
    ],
  },
  {
    heading: "8. Do we use automated processing of your personal data?",
    blocks: [
      {
        type: "p",
        text: "We would like to inform you that we do not use so-called profiling, i.e. automated processing, in the provision of our services.",
      },
    ],
  },
  {
    heading: "9. What rights do you have in relation to the processing of your personal data?",
    blocks: [
      {
        type: "p",
        text: "Proper processing of your personal data is important to us and its protection is a matter of course. When processing personal data, you can exercise the following rights:",
      },
      { type: "h3", text: "Information on the processing of your personal data" },
      {
        type: "p",
        text: "The content of the information is mainly the identity and contact details of the controller, the purposes of the processing, the categories of personal data concerned, the recipient or categories of recipients of personal data, information on the transfer of personal data to third countries, the period of retention of personal data, authorized controllers, a calculation of your rights, the possibility of contacting the Personal Data Protection Office, the source of the processed personal data, information on whether and how automated decision-making and profiling occur.",
      },
      { type: "h3", text: "Right to access personal data" },
      {
        type: "p",
        text: "You have the right to obtain confirmation as to whether or not personal data are being processed and, if so, to access information on the purposes of the processing, the categories of personal data concerned, the recipients or categories of recipients, the period for which personal data will be stored, information on your rights, the right to lodge a complaint with the Personal Data Protection Authority, information on the source of personal data, information on whether automated decision-making and profiling are taking place, information and guarantees in the event of a transfer of personal data to a third country or an international organisation. You have the right to obtain copies of the processed personal data.",
      },
      { type: "h3", text: "Right to rectification" },
      {
        type: "p",
        text: "Are we processing your outdated or inaccurate personal data? Have you changed your e-mail address, for example? Please inform us and we will correct the personal data.",
      },
      { type: "h3", text: "Right to erasure (right to be forgotten)" },
      {
        type: "p",
        text: "In some cases provided for by law, we are obliged to delete your personal data at your request. However, each such request is subject to an individual assessment of whether the conditions are met, because, for example, the company VOLTEROOM may have an obligation or a legitimate interest, if it outweighs your interests, to retain personal data.",
      },
      { type: "h3", text: "Right to restriction of processing" },
      {
        type: "p",
        text: "If you wish us to process your personal data exclusively for the most necessary legal reasons or to block your personal data.",
      },
      { type: "h3", text: "Right to data portability" },
      {
        type: "p",
        text: "If you wish us to provide your personal data to another operator, another company, we will transfer your personal data in an appropriate format, if there are no legal or other significant obstacles preventing us from doing so, to the entity designated by you.",
      },
      { type: "h3", text: "Right to object to automated individual decision-making" },
      {
        type: "p",
        text: "If you find out or even believe that we are processing personal data in violation of the protection of your private and personal life or in violation of legal regulations, please contact us and ask us for an explanation or to eliminate the unsatisfactory situation that has arisen.",
      },
      {
        type: "p",
        text: "You can also directly object to automated decision-making.",
      },
      {
        type: "h3",
        text: "Right to submit a complaint or suggestion to the Office for Personal Data Protection",
      },
      {
        type: "p",
        text: "You can at any time submit your complaint or suggestion regarding the processing of personal data to the supervisory authority, namely the Office for Personal Data Protection of the Slovak Republic, with its registered office at Hraničná 12, 820 07 Bratislava 27, Slovak Republic, Company ID: 36 064 220, tel. no.: +421/2/3231 3220, website https://dataprotection.gov.sk/uoou/",
      },
    ],
  },
  {
    heading: "10. Where can you exercise your rights and is there a fee for exercising them?",
    blocks: [
      {
        type: "p",
        text: "You can exercise your individual rights with VOLTEROOM by e-mail to info@volteroom.com or in writing to the correspondence address Znievska 3060/8, 851 06 Bratislava-Petržalka.",
      },
      {
        type: "p",
        text: "We provide all notifications and statements regarding your exercised rights free of charge. However, if the request is clearly unfounded or disproportionate, especially because it is repeated, we are entitled to charge a reasonable fee taking into account the administrative costs associated with providing the requested information. In the event of a repeated request for copies of the processed personal data, we reserve the right to charge a reasonable fee for administrative costs for this reason.",
      },
      { type: "h3", text: "How long can you expect a response from VOLTEROOM?" },
      {
        type: "p",
        text: "We will provide you with a statement and, if applicable, information about the measures taken as soon as possible, but no later than within one month. We are entitled to extend the deadline by two months if necessary and due to the complexity and number of requests. We will inform you about the extension of the deadline, including the reason.",
      },
    ],
  },
  {
    heading: "11. Who can access your data?",
    blocks: [
      {
        type: "p",
        text: "The controller, its employees and contractual partners, in particular IT service providers, legal advice and courier services, have access to personal data.",
      },
      {
        type: "p",
        text: "For example, these may be external companies managing our systems or other services ensuring the proper operation of the company and the processing of personal data. We have concluded a personal data processing agreement with the aforementioned partners and they are also bound by strict rules for the protection of personal data, including confidentiality, so that the highest possible standard of legal protection is maintained, corresponding to the requirements of applicable legal regulations in the Slovak Republic.",
      },
    ],
  },
  {
    heading:
      "12. Overview of selected legal regulations governing the issue of personal data",
    blocks: [
      { type: "h3", text: "European framework" },
      {
        type: "ul",
        items: [
          "Charter of Fundamental Rights of the EUROPEAN UNION",
          "Regulation 2016/679 of the European Parliament and of the Council of 27 April 2016 on the protection of natural persons and on the free movement of such data, and repealing Directive 95/46/EC (General Data Protection Regulation, GDPR)",
        ],
      },
      { type: "h3", text: "National legislation" },
      {
        type: "ul",
        items: [
          "Constitution of the Slovak Republic (published under No. 460/1992 Coll.)",
          "Act No. 18/2018 Coll. on the protection of personal data and on amending and supplementing certain acts, as amended",
        ],
      },
    ],
  },
  {
    heading: "13. Where can you contact us?",
    blocks: [
      {
        type: "p",
        text: "If you have any questions or comments about this information obligation, please do not hesitate to contact us at any time by email at info@volteroom.com or in writing to the correspondence address Znievska 3060/8, 851 06 Bratislava-Petržalka.",
      },
    ],
  },
];
