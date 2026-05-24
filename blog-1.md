# `any` কেন "Type Safety Hole"? `unknown` কেন Safer? এবং Type Narrowing কী?

## ভূমিকা

এই blog-এ আমরা তিনটা জিনিস নিয়ে বিস্তারিত আলোচনা করবো:

1. `any` কেন "type safety hole" বলা হয়
2. `unknown` কেন safer choice
3. Type Narrowing কী এবং কীভাবে কাজ করে

---

## Part 1: `any` কেন "Type Safety Hole"?

### প্রথমে বুঝি — TypeScript কেন ব্যবহার করি?

JavaScript-এ কোনো type নেই। যেকোনো variable-এ যেকোনো কিছু রাখা যায়। এতে bug ধরা কঠিন হয়ে যায়।

TypeScript আসে এই সমস্যা সমাধান করতে — **compile time-এ bug ধরার জন্য**, runtime crash হওয়ার আগেই।

কিন্তু `any` ব্যবহার করলে এই পুরো সুবিধাটা নষ্ট হয়ে যায়।

---

### `any` কী করে?

`any` দিয়ে কোনো variable declare করলে TypeScript সেই variable-এর ব্যাপারে **সম্পূর্ণ চুপ** হয়ে যায়। কোনো check নেই, কোনো error নেই।

```typescript
let value: any = "আমি একটা string";

// এগুলো সব TypeScript allow করবে — কোনো error নেই
value.toUpperCase(); // ✅ okay (string method — এখন সত্যিই কাজ করবে)
value.toFixed(2); // ✅ okay (number method — কিন্তু string-এ নেই! 😱)
value.jakijaki(); // ✅ okay (এই method exist-ই করে না! 😱)
```

TypeScript একটাও error দেয়নি। কিন্তু এগুলো run করলে অনেকগুলো crash করবে।

---

### "Type Safety Hole" মানে কী?

এটা বোঝার জন্য একটা real-life উদাহরণ দেখি:

ধরো তোমার বাসায় একটা দেয়াল আছে যেটা আগুন থেকে বাঁচায় (firewall)। এই দেয়ালের কারণে এক রুমে আগুন লাগলে অন্য রুমে ছড়ায় না।

TypeScript-এর type system হলো এই দেয়ালের মতো — bug এক জায়গায় আটকে রাখে।

কিন্তু `any` ব্যবহার করা মানে সেই দেয়ালে একটা **ফুটো** করে দেওয়া। ওই ফুটো দিয়ে আগুন ছড়িয়ে পড়ে — মানে bug ছড়িয়ে পড়ে।

```typescript
// এখানে `any` শুরু হলো
function getDataFromServer(): any {
  return { user: { name: "Rahim", age: 25 } };
}

const data = getDataFromServer(); // data-র type: any

// এখন `any` ছড়িয়ে পড়ছে...
const user = data.user; // user-এর type: any (infected!)
const name = user.name; // name-এর type: any (infected!)
const upper = name.toUpperCase(); // upper-এর type: any (infected!)

// TypeScript কোথাও কিছু বলছে না — পুরো chain-এ `any` ছড়িয়ে গেছে
```

এই "ছড়িয়ে পড়া" বন্ধ করা কঠিন হয়ে যায়। একটা `any` থেকে পুরো codebase infected হতে পারে। এজন্যই একে **"type safety hole"** বলা হয়।

---

### `any`-র সবচেয়ে বড় সমস্যা — Real Example

```typescript
function calculateDiscount(price: any, discount: any) {
  return price - (price * discount) / 100;
}

// সঠিক call
console.log(calculateDiscount(1000, 10)); // 900 ✅

// ভুল call — TypeScript কিছু বলবে না!
console.log(calculateDiscount("1000", "10")); // "1000" - "100" = NaN 💥
console.log(calculateDiscount(null, 10)); // null - 0 = -0 💥
console.log(calculateDiscount(undefined, 10)); // NaN 💥
```

TypeScript কোনো error দেয়নি। কিন্তু সব ভুল result আসছে। এই bug গুলো production-এ গিয়ে ধরা পড়বে — যখন real user ক্ষতিগ্রস্ত হবে।

---

## Part 2: `unknown` কেন Safer Choice?

### `unknown` কী?

`unknown` হলো `any`-র safe version। পার্থক্য একটাই:

- **`any`** দিয়ে কিছু declare করলে → সরাসরি যা খুশি করা যায়
- **`unknown`** দিয়ে কিছু declare করলে → আগে prove করতে হবে এটা কী type, তারপর ব্যবহার করা যাবে

```typescript
let a: any = "hello";
let b: unknown = "hello";

// any — সব কিছু allow
a.toUpperCase(); // ✅ TypeScript চুপ
a.toFixed(); // ✅ TypeScript চুপ (কিন্তু crash করবে!)

// unknown — সরাসরি use করতে দেবে না
b.toUpperCase(); // ❌ Error: Object is of type 'unknown'
b.toFixed(); // ❌ Error: Object is of type 'unknown'
```

TypeScript বলছে: _"ভাই, এটা `unknown` — আগে বলো এটা কী, তারপর কাজ করো।"_

এটা ঝামেলা মনে হলেও এটাই আমাদের রক্ষা করছে।

---

### `unknown` কোথায় ব্যবহার করবো?

যেখানেই data-র shape আগে থেকে জানি না — সেখানেই `unknown` ব্যবহার করা উচিত:

**১. API থেকে data আনার সময়:**

```typescript
async function fetchUser(id: number) {
  const response = await fetch(`/api/users/${id}`);
  const data: unknown = await response.json(); // ✅ unknown, any নয়
  // এখানেই check করতে হবে data কী
}
```

**২. `JSON.parse` করার সময়:**

```typescript
const raw = localStorage.getItem("user");
const parsed: unknown = JSON.parse(raw ?? "{}"); // ✅ unknown
// parse করলেই যা পাবো সেটা unknown — কারণ আমরা জানি না কী আছে
```

**৩. Error handle করার সময়:**

```typescript
try {
  // কিছু একটা
} catch (error: unknown) {
  // ✅ TypeScript 4+ এ এটাই default
  // error কী সেটা আগে check করো
}
```

## Part 3: Type Narrowing কী এবং কীভাবে কাজ করে?

### Type Narrowing মানে কী?

**Narrowing** মানে সংকুচিত করা বা ছোট করা।

TypeScript যখন জানে একটা value `unknown` বা `string | number` এর মতো broad type — তখন runtime check দিয়ে TypeScript-কে বলা যায় _"এই block-এর ভেতরে এটা এই specific type।"_ TypeScript তখন সেই জ্ঞান ব্যবহার করে আমাদের help করে।

এই process-ই হলো **Type Narrowing** — broad type থেকে specific type-এ আসা।

---

### Narrowing পদ্ধতি ১: `typeof` Guard

`typeof` দিয়ে primitive type গুলো check করা যায় — `string`, `number`, `boolean`, `bigint`, `symbol`, `undefined`, `function`।

```typescript
function describe(value: unknown): string {
  if (typeof value === "string") {
    // এই block-এর ভেতরে TypeScript জানে: value হলো string
    return `এটা একটা string: "${value.toUpperCase()}"`;
  }

  if (typeof value === "number") {
    // এই block-এর ভেতরে TypeScript জানে: value হলো number
    return `এটা একটা number: ${value.toFixed(2)}`;
  }

  if (typeof value === "boolean") {
    // এই block-এর ভেতরে TypeScript জানে: value হলো boolean
    return `এটা একটা boolean: ${value ? "হ্যাঁ" : "না"}`;
  }

  return "এটা কী জিনিস বুঝলাম না!";
}

console.log(describe("hello")); // এটা একটা string: "HELLO"
console.log(describe(3.14159)); // এটা একটা number: 3.14
console.log(describe(true)); // এটা একটা boolean: হ্যাঁ
console.log(describe(null)); // এটা কী জিনিস বুঝলাম না!
```

---

### Narrowing পদ্ধতি ২: `instanceof` Guard

Class বা built-in object (যেমন `Date`, `Error`, `Array`) check করার জন্য `instanceof` ব্যবহার করি।

```typescript
function handleError(error: unknown): string {
  if (error instanceof Error) {
    // এখন TypeScript জানে: error হলো Error object
    // তাই error.message, error.name, error.stack access করা যাবে
    return `Error ধরা পড়েছে: ${error.message}`;
  }

  if (error instanceof TypeError) {
    return `Type সংক্রান্ত সমস্যা: ${error.message}`;
  }

  if (typeof error === "string") {
    return `String error: ${error}`;
  }

  return "অজানা error";
}

try {
  throw new Error("Connection failed");
} catch (err: unknown) {
  console.log(handleError(err)); // Error ধরা পড়েছে: Connection failed
}
```

---

### Narrowing পদ্ধতি ৩: `in` Operator Guard

Object-এ কোনো নির্দিষ্ট property আছে কিনা check করতে `in` ব্যবহার করি। এটা Union type-এ খুব কাজে আসে।

```typescript
interface Dog {
  name: string;
  bark(): void;
}

interface Cat {
  name: string;
  meow(): void;
}

function makeSound(animal: Dog | Cat) {
  if ("bark" in animal) {
    // TypeScript জানে: animal হলো Dog
    animal.bark(); // ✅
  } else {
    // TypeScript জানে: animal হলো Cat
    animal.meow(); // ✅
  }
}

makeSound({ name: "Tommy", bark: () => console.log("Woof!") }); // Woof!
makeSound({ name: "Kitty", meow: () => console.log("Meow!") }); // Meow!
```

---

### Narrowing পদ্ধতি ৪: Custom Type Guard Function

এটা সবচেয়ে powerful পদ্ধতি। নিজে একটা function লিখি যেটা check করে — এবং TypeScript-কে জানায় result কী।

এই function-এর return type হয় `value is SomeType` — এটাই TypeScript-কে বলে: _"যদি এই function true return করে, তাহলে value ওই type।"_

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// Custom type guard function
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" && // প্রথমে দেখো এটা object কিনা
    value !== null && // null বাদ দাও (null-ও object!)
    "id" in value && // id property আছে কিনা
    "name" in value && // name property আছে কিনা
    "email" in value && // email property আছে কিনা
    typeof (value as User).id === "number" && // id কি number?
    typeof (value as User).name === "string" && // name কি string?
    typeof (value as User).email === "string" // email কি string?
  );
}

// এবার API call-এ ব্যবহার করি
async function fetchUser(id: number): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${id}`);
    const data: unknown = await response.json(); // unknown দিয়ে শুরু

    if (isUser(data)) {
      // এই block-এ TypeScript পুরোপুরি জানে data হলো User ✅
      console.log(`স্বাগতম, ${data.name}!`); // ✅ string
      console.log(`আপনার ID: ${data.id}`); // ✅ number
      console.log(`Email: ${data.email}`); // ✅ string
      return data;
    } else {
      console.error("Server ভুল format-এ data দিয়েছে!");
      return null;
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Fetch failed: ${error.message}`);
    }
    return null;
  }
}
```

---

### Narrowing পদ্ধতি ৫: Equality Narrowing

সরাসরি value compare করলেও TypeScript narrow করতে পারে:

```typescript
function checkValue(value: string | null | undefined) {
  if (value === null) {
    // TypeScript জানে: value হলো null
    console.log("value null");
    return;
  }

  if (value === undefined) {
    // TypeScript জানে: value হলো undefined
    console.log("value undefined");
    return;
  }

  // এখানে TypeScript নিশ্চিত: value হলো string (null ও undefined বাদ গেছে)
  console.log(value.toUpperCase()); // ✅
}
```

---

### Control Flow Analysis — TypeScript কীভাবে Narrow করে?

TypeScript আমাদের code পড়ে এবং বোঝে — কোন block-এ কী possible। এটাকে বলে **Control Flow Analysis।**

```typescript
function example(value: string | number | boolean) {
  // এখানে value: string | number | boolean

  if (typeof value === "string") {
    // এখানে value: string ✅
    console.log(value.length);
    return;
  }

  // এখানে value: number | boolean (string বাদ গেছে)

  if (typeof value === "number") {
    // এখানে value: number ✅
    console.log(value * 2);
    return;
  }

  // এখানে value: boolean (string ও number দুটোই বাদ গেছে)
  console.log(value ? "হ্যাঁ" : "না"); // ✅
}
```

TypeScript প্রতিটা `if` block-এর পরে জানে কোন type গুলো এখনো possible। এটাই Control Flow Analysis।

## সংক্ষিপ্ত সারাংশ

### `any` কেন "Type Safety Hole"?

- TypeScript-এর সব type checking বন্ধ করে দেয়
- `any` থেকে আসা value-ও `any` হয়ে যায় — পুরো codebase-এ ছড়ায়
- Bug গুলো compile time-এ না, runtime-এ ধরা পড়ে — তখন অনেক দেরি হয়ে যায়

### `unknown` কেন Safer?

- যেকোনো value রাখা যায় — কিন্তু ব্যবহারের আগে type prove করতে হয়
- TypeScript force করে সব case handle করতে — কোনো case miss হয় না
- External data (API, JSON, user input) handle করার সঠিক উপায়

### Type Narrowing কী?

- `unknown` বা broad type-কে specific type-এ নামিয়ে আনার process
- পদ্ধতিগুলো: `typeof`, `instanceof`, `in`, Custom Type Guard, Equality Check
- TypeScript Control Flow Analysis করে — প্রতিটা block-এ জানে কী possible

---

> **মূল কথা:** `any` দিয়ে TypeScript-কে চুপ করালে মনে হয় সমস্যা সমাধান হয়েছে — কিন্তু সমস্যা লুকিয়ে থাকে। `unknown` + Type Narrowing দিয়ে সমস্যার সত্যিকারের সমাধান করো।

---
