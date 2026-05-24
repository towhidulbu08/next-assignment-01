# OOP-এর চারটি স্তম্ভ — TypeScript-এ কীভাবে Code Manage করে এবং Complexity কমায়?

---

## ভূমিকা (Introduction)

বড় project-এ code লিখতে গেলে সবচেয়ে বড় সমস্যা হলো — **complexity**। যত feature বাড়ে, code তত জটিল হয়, bug ধরা কঠিন হয়, নতুন কেউ code বুঝতে পারে না।

**Object-Oriented Programming (OOP)** এই সমস্যার সমাধান দেয়। OOP-এর চারটি মূল স্তম্ভ আছে:

1. **Encapsulation** — ডেটা লুকিয়ে রাখা
2. **Inheritance** — বৈশিষ্ট্য উত্তরাধিকার সূত্রে পাওয়া
3. **Polymorphism** — একই কাজ ভিন্নভাবে করা
4. **Abstraction** — জটিলতা লুকিয়ে সহজ interface দেখানো

TypeScript class-based OOP fully support করে — এবং type system দিয়ে এটাকে আরো শক্তিশালী করে।

এই blog-এ প্রতিটা pillar বাংলায় বিস্তারিত আলোচনা করবো, real-world code সহ।

---

## Pillar 1: Encapsulation — ডেটা লুকিয়ে রাখো, নিরাপদ রাখো

**Encapsulation** মানে — class-এর ভেতরের data সরাসরি বাইরে থেকে access করতে না দেওয়া। `private` keyword দিয়ে এটা করা হয়।

সহজ ভাষায়: **"ভেতরের জিনিস ভেতরে থাকবে, শুধু নির্দিষ্ট দরজা দিয়ে ঢোকা যাবে।"**

```typescript
class BankAccount {
  private balance: number; // বাইরে থেকে সরাসরি access নেই

  constructor(initialBalance: number) {
    this.balance = initialBalance;
  }

  deposit(amount: number): void {
    if (amount <= 0) throw new Error("Amount must be positive!");
    this.balance += amount;
    console.log(`Deposited ৳${amount}. Balance: ৳${this.balance}`);
  }

  withdraw(amount: number): void {
    if (amount > this.balance) throw new Error("Insufficient balance!");
    this.balance -= amount;
    console.log(`Withdrawn ৳${amount}. Balance: ৳${this.balance}`);
  }

  getBalance(): number {
    return this.balance; // শুধু দেখা যাবে, বদলানো যাবে না
  }
}

const account = new BankAccount(5000);
account.deposit(2000); // Deposited ৳2000. Balance: ৳7000
account.withdraw(10000); // ❌ Error: Insufficient balance!
// account.balance = -99999; // ❌ Error: 'balance' is private ✅
```

`private` না থাকলে যে কেউ `account.balance = -99999` করে দিতে পারতো — কোনো check ছাড়াই। Encapsulation এটা আটকায়।

### Large-Scale Project-এ Encapsulation কেন গুরুত্বপূর্ণ?

- **Bug কম হয়:** কেউ ভুল করেও ভেতরের data নষ্ট করতে পারবে না
- **Maintainability বাড়ে:** ভেতরের implementation বদলালেও বাইরের code ভাঙে না
- **Team কাজ সহজ হয়:** এক developer-এর class অন্যজন ভুলভাবে ব্যবহার করতে পারবে না

---

## Pillar 2: Inheritance — বৈশিষ্ট্য উত্তরাধিকারসূত্রে নাও, নতুন করে লিখতে হবে না

**Inheritance** মানে — একটা class আরেকটা class-এর সব কিছু পেয়ে যায়, এবং চাইলে নিজের নতুন কিছু যোগ করতে পারে।

সহজ ভাষায়: **"বাবার সব বৈশিষ্ট্য ছেলে পাবে — নিজের কিছু থাকলে সেটাও যোগ করতে পারবে।"**

ধরো `Admin` আর `Student` দুইজনই `User` — দুইজনের `login()` একই। Inheritance ছাড়া এই code দুইবার লিখতে হতো।

```typescript
// Parent class — common feature এখানে
class User {
  constructor(protected name: string) {}

  login(): void {
    console.log(`${this.name} login করেছে।`); // সবাই এটা পাবে
  }
}

// Admin — User-এর সব পেলো + নিজের extra feature যোগ করলো
class Admin extends User {
  deletePost(postId: number): void {
    console.log(`${this.name} post #${postId} delete করলেন।`);
  }
}

// Student — User-এর সব পেলো + নিজের extra feature যোগ করলো
class Student extends User {
  submitAssignment(subject: string): void {
    console.log(`${this.name} "${subject}" assignment জমা দিলো।`);
  }
}

// ব্যবহার
const admin = new Admin("করিম");
admin.login(); // করিম login করেছে। ✅ (Parent থেকে পেয়েছে)
admin.deletePost(5); // করিম post #5 delete করলেন। ✅

const student = new Student("নাদিয়া");
student.login(); // নাদিয়া login করেছে। ✅ (Parent থেকে পেয়েছে)
student.submitAssignment("Math"); // নাদিয়া "Math" assignment জমা দিলো। ✅
```

`login()` একবারই লেখা হয়েছে — কিন্তু Admin আর Student দুইজনই ব্যবহার করতে পারছে। নতুন `Teacher` class লাগলে শুধু `extends User` করলেই `login()` পেয়ে যাবে।

### Large-Scale Project-এ Inheritance কেন গুরুত্বপূর্ণ?

- **Code Reuse:** Common logic একবার লেখো, সব child class পাবে
- **Consistency:** সব User-এর `login()` একইভাবে কাজ করবে
- **Scalability:** নতুন `Teacher` class লাগলে শুধু `extends User` করলেই হবে — বাকি code ছুঁতে হবে না

---

## Pillar 3: Polymorphism — একই নামে, ভিন্ন আচরণ

**Polymorphism** (পলিমর্ফিজম) — Greek শব্দ, মানে **"অনেক রূপ।"**

Programming-এ মানে হলো — একই method call, কিন্তু ভিন্ন class-এ ভিন্নভাবে কাজ করে।

সহজ ভাষায়: **"সবাইকে একই command দাও — সবাই নিজের মতো করে সাড়া দেবে।"**

```typescript
// Parent class
class Animal {
  constructor(protected name: string) {}

  makeSound(): void {
    console.log(`${this.name} কিছু একটা আওয়াজ করলো।`);
  }
}

// প্রতিটা child class নিজের মতো makeSound() override করছে
class Dog extends Animal {
  makeSound(): void {
    console.log(`${this.name} বললো: Woof! 🐶`);
  }
}

class Cat extends Animal {
  makeSound(): void {
    console.log(`${this.name} বললো: Meow! 🐱`);
  }
}

class Cow extends Animal {
  makeSound(): void {
    console.log(`${this.name} বললো: Moo! 🐄`);
  }
}

// ✅ Polymorphism-এর আসল সৌন্দর্য
// একটাই loop — প্রতিটা নিজের মতো behave করছে
const animals: Animal[] = [new Dog("টমি"), new Cat("মিনি"), new Cow("গাভী")];

animals.forEach((animal) => animal.makeSound());

// Output:
// টমি বললো: Woof! 🐶
// মিনি বললো: Meow! 🐱
// গাভী বললো: Moo! 🐄
```

`makeSound()` একবারই call করা হচ্ছে — কিন্তু কে call পাচ্ছে তার উপর নির্ভর করে আলাদা আলাদা কাজ হচ্ছে। নতুন `Duck` class যোগ করলেও এই loop বদলাতে হবে না।

### Large-Scale Project-এ Polymorphism কেন গুরুত্বপূর্ণ?

- **নতুন feature সহজে যোগ হয়:** নতুন `Duck` class লাগলে শুধু `extends Animal` করো — বাকি code ছুঁতে হবে না
- **Code simple থাকে:** একটাই loop সব handle করে — কোন class সেটা জানার দরকার নেই
- **Complexity কমে:** Caller-কে আলাদা আলাদা if/else লিখতে হয় না

---

## Pillar 4: Abstraction — জটিলতা লুকাও, সহজ interface দেখাও

### Abstraction কী?

**Abstraction** মানে হলো — ভেতরের জটিল কাজ লুকিয়ে রেখে বাইরে একটা সহজ interface দেওয়া।

সহজ ভাষায়: **"TV দেখতে হলে remote-এর শুধু কয়েকটা button জানলেই হয় — ভেতরে circuit কীভাবে কাজ করে জানতে হয় না।"**

TypeScript-এ `abstract class` দিয়ে এই কাজটা করা হয়। Abstract class মানে হলো একটা **blueprint** — এটা থেকে সরাসরি object বানানো যায় না, শুধু inherit করা যায়।

### Beginner-Friendly Example: Shape এবং Area

ধরো তুমি বিভিন্ন shape (Circle, Rectangle, Triangle) এর area বের করতে চাও। প্রতিটা shape-এর area বের করার formula আলাদা — কিন্তু সবার কাছ থেকে আমরা একটাই কাজ চাই: `getArea()`।

```typescript
// Abstract class — এটা blueprint, সরাসরি object বানানো যাবে না
abstract class Shape {
  color: string;

  constructor(color: string) {
    this.color = color;
  }

  // abstract method — প্রতিটা shape নিজের মতো implement করবে
  // কীভাবে area বের করবে সেটা Shape জানে না — child class জানে
  abstract getArea(): number;

  // এই method সব shape-এর জন্য একই — তাই এখানেই লেখা আছে
  describe(): void {
    console.log(
      `এটা একটা ${this.color} রঙের shape। Area: ${this.getArea().toFixed(2)}`,
    );
  }
}

// Circle — নিজের মতো area বের করে
class Circle extends Shape {
  radius: number;

  constructor(color: string, radius: number) {
    super(color);
    this.radius = radius;
  }

  // Circle-এর নিজস্ব formula: π × r²
  getArea(): number {
    return Math.PI * this.radius * this.radius;
  }
}

// Rectangle — নিজের মতো area বের করে
class Rectangle extends Shape {
  width: number;
  height: number;

  constructor(color: string, width: number, height: number) {
    super(color);
    this.width = width;
    this.height = height;
  }

  // Rectangle-এর নিজস্ব formula: width × height
  getArea(): number {
    return this.width * this.height;
  }
}

// Triangle — নিজের মতো area বের করে
class Triangle extends Shape {
  base: number;
  height: number;

  constructor(color: string, base: number, height: number) {
    super(color);
    this.base = base;
    this.height = height;
  }

  // Triangle-এর নিজস্ব formula: ½ × base × height
  getArea(): number {
    return 0.5 * this.base * this.height;
  }
}

// ✅ ব্যবহার — সহজ!
// যে ব্যবহার করছে সে শুধু জানে: getArea() call করো, area পাবে
// ভেতরে কীভাবে calculate হচ্ছে জানার দরকার নেই

const shapes: Shape[] = [
  new Circle("লাল", 5),
  new Rectangle("নীল", 4, 6),
  new Triangle("সবুজ", 3, 8),
];

shapes.forEach((shape) => shape.describe());

// Output:
// এটা একটা লাল রঙের shape। Area: 78.54
// এটা একটা নীল রঙের shape। Area: 24.00
// এটা একটা সবুজ রঙের shape। Area: 12.00
```

দেখো — `describe()` method কোনো shape জানে না। সে শুধু `getArea()` call করে। ভেতরে কী formula চলছে সেটা সম্পূর্ণ লুকানো। এটাই **Abstraction।**

### একটা ভুল চেষ্টা দেখো

```typescript
const s = new Shape("হলুদ"); // ❌ Error!
// Cannot create an instance of an abstract class.
```

Abstract class থেকে সরাসরি object বানানো যায় না — এটাই তার নিয়ম। শুধু inherit করা যাবে।

### Large-Scale Project-এ Abstraction কেন গুরুত্বপূর্ণ?

- **Complexity লুকায়:** ব্যবহারকারী শুধু _কী_ করতে হবে জানলেই চলে — _কীভাবে_ হচ্ছে জানতে হয় না
- **নতুন shape যোগ সহজ:** কাল `Pentagon` লাগলে শুধু `extends Shape` করো, বাকি সব code ঠিক থাকবে
- **Code consistent থাকে:** সব shape-কে `getArea()` implement করতেই হবে — কেউ ভুলে বাদ দিতে পারবে না

---

## চারটি Pillar একসাথে — Real-World Example

এবার দেখি কীভাবে চারটি pillar একটা ছোট e-commerce system-এ একসাথে কাজ করে:

```typescript
// ======= ABSTRACTION =======
// Interface দিয়ে contract তৈরি
interface Notifiable {
  sendNotification(message: string): Promise<void>;
}

// ======= ENCAPSULATION =======
// Abstract base class — common data লুকানো আছে
abstract class Product {
  private id: number;
  private stock: number;

  constructor(
    id: number,
    protected name: string,
    protected price: number,
    stock: number,
  ) {
    this.id = id;
    this.stock = stock;
  }

  // ======= ABSTRACTION =======
  // Subclass নিজের মতো discount calculate করবে
  abstract getDiscount(): number;

  // Encapsulation — stock সরাসরি বদলানো যাবে না
  getStock(): number {
    return this.stock;
  }

  reduceStock(quantity: number): void {
    if (quantity > this.stock) {
      throw new Error(`"${this.name}"-এর stock কম! আছে: ${this.stock}`);
    }
    this.stock -= quantity;
  }

  getFinalPrice(): number {
    return this.price - this.getDiscount();
  }

  getSummary(): string {
    return `${this.name} — মূল্য: ৳${this.price}, ছাড়: ৳${this.getDiscount()}, চূড়ান্ত: ৳${this.getFinalPrice()}`;
  }
}

// ======= INHERITANCE =======
// Electronics product
class Electronics extends Product {
  private warrantyMonths: number;

  constructor(
    id: number,
    name: string,
    price: number,
    stock: number,
    warranty: number,
  ) {
    super(id, name, price, stock);
    this.warrantyMonths = warranty;
  }

  // ======= POLYMORPHISM =======
  getDiscount(): number {
    return this.price * 0.1; // Electronics-এ ১০% ছাড়
  }

  getWarranty(): string {
    return `${this.warrantyMonths} মাসের ওয়ারেন্টি`;
  }
}

// Clothing product — আলাদা discount logic
class Clothing extends Product {
  private size: string;

  constructor(
    id: number,
    name: string,
    price: number,
    stock: number,
    size: string,
  ) {
    super(id, name, price, stock);
    this.size = size;
  }

  // ======= POLYMORPHISM =======
  getDiscount(): number {
    return this.price * 0.2; // Clothing-এ ২০% ছাড়
  }
}

// Food product — discount নেই
class Food extends Product {
  private expiryDate: Date;

  constructor(
    id: number,
    name: string,
    price: number,
    stock: number,
    expiry: Date,
  ) {
    super(id, name, price, stock);
    this.expiryDate = expiry;
  }

  // ======= POLYMORPHISM =======
  getDiscount(): number {
    return 0; // Food-এ কোনো ছাড় নেই
  }
}

// ======= POLYMORPHISM =======
// সব product-এর জন্য একটাই function — type জানার দরকার নেই
function printProductInfo(products: Product[]): void {
  products.forEach((product) => {
    console.log(product.getSummary()); // প্রতিটা নিজের মতো কাজ করছে
  });
}

// Test করি
const products: Product[] = [
  new Electronics(1, "Samsung TV", 50000, 10, 24),
  new Clothing(2, "পাঞ্জাবি", 1500, 50, "L"),
  new Food(3, "বিরিয়ানি", 350, 100, new Date("2025-12-31")),
];

printProductInfo(products);
```

**Output:**

```
Samsung TV — মূল্য: ৳50000, ছাড়: ৳5000, চূড়ান্ত: ৳45000
পাঞ্জাবি — মূল্য: ৳1500, ছাড়: ৳300, চূড়ান্ত: ৳1200
বিরিয়ানি — মূল্য: ৳350, ছাড়: ৳0, চূড়ান্ত: ৳350
```

---

## উপসংহার (Conclusion)

OOP-এর চারটি pillar একসাথে কীভাবে কাজ করে সেটা এক নজরে দেখি:

| Pillar            | মূল কাজ                         | Complexity কমায় কীভাবে                      |
| ----------------- | ------------------------------- | -------------------------------------------- |
| **Encapsulation** | Data লুকানো, controlled access  | ভুল data manipulation বন্ধ করে               |
| **Inheritance**   | Common code reuse               | একই code বারবার লিখতে হয় না                 |
| **Polymorphism**  | একই interface, ভিন্ন behavior   | নতুন type যোগ করলে পুরনো code বদলাতে হয় না  |
| **Abstraction**   | জটিলতা লুকিয়ে simple interface | Developer শুধু _কী_ জানলেই চলে, _কীভাবে_ নয় |

Large-scale TypeScript project-এ এই চারটি pillar ছাড়া code দ্রুত **"spaghetti code"** হয়ে যায় — যেখানে সব কিছু সব কিছুর সাথে জড়িয়ে থাকে, কিছু বদলালে অন্য কিছু ভেঙে পড়ে।

OOP এই জটিলতাকে ভেঙে ছোট ছোট, manageable, আর reusable টুকরোতে পরিণত করে।

> **মূল কথা:** OOP শুধু coding technique নয় — এটা large-scale project-এ **চিন্তা করার একটা উপায়।** সঠিকভাবে ব্যবহার করলে code পড়া, বোঝা, বদলানো এবং test করা — সব সহজ হয়ে যায়।

---

_TypeScript Blog Series — Blog 2_
