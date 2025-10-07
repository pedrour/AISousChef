# AI Sous Chef 🍳

**AI Sous Chef** is a smart recipe generator build on Firebase Studio + Gemini CLI that helps you discover new dishes based on the ingredients you have on hand. Whether you provide a list of ingredients, snap a photo of them, or just want a random recipe, AI Sous Chef has you covered. Plus, it can even read the recipe out loud to you while you cook!


## ✨ Features

- **Generate Recipes from Text:** Simply type in the ingredients you have, and AI Sous Chef will create a custom recipe for you.
- **Generate Recipes from Images:** Take a picture of your ingredients, and the app will intelligently identify them and suggest a recipe.
- **Surprise Me!** Don't know what to cook? Let AI Sous Chef generate a random recipe for you.
- **Text-to-Speech:** Keep your hands free in the kitchen! The app can read the recipe instructions aloud with the click of a button.
- **Responsive Design:** A clean and intuitive interface that works beautifully on both desktop and mobile devices.

## 🛠️ Technologies Used

- **Framework:** [Next.js](https://nextjs.org/)
- **AI/ML:** [Google's Gemini Pro Vision](https://ai.google.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/)

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/your_username/your_project_name.git
    ```
2.  **Navigate to the project directory**
    ```sh
    cd your_project_name
    ```
3.  **Install NPM packages**
    ```sh
    npm install
    ```
4.  **Set up your environment variables**

    Create a `.env.local` file in the root of your project and add your Google AI API key:
    ```
    GOOGLE_GENAI_API_KEY=your_api_key_here
    ```

### Running the Application

1.  **Start the development server**
    ```sh
    npm run dev
    ```
2.  **Open your browser**

    Navigate to `http://localhost:9002` to see the application in action.

## 🔮 Future Enhancements

- **Recipe Saving and History:** Allow users to save their favorite recipes and view their generation history.
- **Voice Selection:** Let users choose from a variety of voices for the text-to-speech feature.
- **Dietary Preferences:** Add options to filter recipes based on dietary restrictions (e.g., vegan, gluten-free).

---

Happy Cooking! 🍽️
