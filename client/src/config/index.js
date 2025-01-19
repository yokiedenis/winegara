export const registerFormControls = [
  {
    name: "userName",
    label: "User Name",
    placeholder: "Enter your username",
    componentType: "input",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  }
]


export const loginFormControls = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];


export const addProductFormElements = [
  {
    label: "Title",
    name: "title",
    componentType: "input",
    type: "text",
    placeholder: "Enter product title",
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter product description",
  },
  {
    label: "Category",
    name: "category",
    componentType: "select",
    options: [
      { id: "Red Wine", label: "Red Wine" },
      { id: "White Wine", label: "White Wine" },
      { id: "Sparkling", label: "Sparkling" },
      { id: "Non-Alcoholic", label: "Non-Alcoholic" },
      { id: "Whiskey and Spirits", label: "Whiskey and Spirits" },
      { id: "Beer", label: "Beer" },
    ],
  },
  {
    label: "Brand",
    name: "brand",
    componentType: "select",
    options: [
      { id: "local wines", label: "local wines" },
      { id: "imported wines", label: "imported wines" },
      { id: "uganda breweries", label: "uganda breweries" },
      { id: "nile breweries", label: "nile breweries" },
      { id: "tequila", label: "tequila" },
      { id: "Uganda waragi", label: "Uganda waragi" },
    ],
  },
  {
    label: "Price",
    name: "price",
    componentType: "input",
    type: "number",
    placeholder: "Enter product price",
  },
  {
    label: "Sale Price",
    name: "salePrice",
    componentType: "input",
    type: "number",
    placeholder: "Enter sale price (optional)",
  },
  {
    label: "Total Stock",
    name: "totalStock",
    componentType: "input",
    type: "number",
    placeholder: "Enter total stock",
  },
];


export const shoppingViewHeaderMenuItems = [
  {
    id: "home",
    label: "Home",
    path: "/shop/home",
  },
  {
    id: "products",
    label: "Products",
    path: "/shop/listing",
  },
  {
    id: "Red Wine",
    label: "Red Wine",
    path: "/shop/listing",
  },
  {
    id: "White Wine",
    label: "White Wine",
    path: "/shop/listing",
  },
  {
    id: "Sparkling",
    label: "Sparkling",
    path: "/shop/listing",
  },
  {
    id: "Non-Alcoholic",
    label: "Non-Alcoholic",
    path: "/shop/listing",
  },
  {
    id: "Whiskey and Spirits",
    label: "Whiskey and Spirits",
    path: "/shop/listing",
  },
  {
    id: "Beer",
    label: "Beer",
    path: "/shop/listing",
  },
  {
    id: "search",
    label: "Search",
    path: "/shop/search",
  },
];


export const filterOptions = {
  category: [
    { id: "Red Wine", label: "Red Wine" },
    { id: "White Wine", label: "White Wine" },
    { id: "Sparkling", label: "Sparkling" },
    { id: "Non-Alcoholic", label: "Non-Alcoholic" },
    { id: "Whiskey and Spirits", label: "Whiskey and Spirits" },
    { id: "Beer", label: "Beer" },
  ],
  brand: [
    { id: "local wines", label: "local wines" },
    { id: "imported wines", label: "imported wines" },
    { id: "uganda breweries", label: "uganda breweries" },
    { id: "nile breweries", label: "nile breweries" },
    { id: "tequila", label: "tequila" },
    { id: "Uganda waragi", label: "Uganda waragi" },
  ],
};


export const sortOptions = [
  { id: "price-lowtohigh", label: "Price: Low to High" },
  { id: "price-hightolow", label: "Price: High to Low" },
  { id: "title-atoz", label: "Title: A to Z" },
  { id: "title-ztoa", label: "Title: Z to A" },
];


export const categoryOptionsMap = {
  RedWine: "Red Wine",
  WhiteWine: "White Wine",
  Sparkling: "Sparkling",
  NonAlcoholic: "Non-Alcoholic",
  WhiskeyandSpirits: "Whiskey and Spirits",
  Beer: "Beer",
};


export const brandOptionsMap = {
  localbrand: "local wines",
  importedbrand: "imported wines",
  ugandabreweries: "uganda breweries",
  nilebreweries: "nile breweries",
  tequila: "tequila",
  Ugandawaragi: "Uganda waragi",
};



export const addressFormControls = [
  {
    label: "Address",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Enter your address",
  },
  {
    label: "City",
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Enter your city",
  },
  {
    label: "Pincode",
    name: "pincode",
    componentType: "input",
    type: "text",
    placeholder: "Enter your pincode",
  },
  {
    label: "Phone",
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "Enter your phone number",
  },
  {
    label: "Notes",
    name: "notes",
    componentType: "textarea",
    placeholder: "Enter any additional notes",
  },
];
