# Code Sentinel

## Description

This project automates pull request reviews using Gemini AI and sends summaries via email.

## Features

- Automated pull request reviews
- Gemini AI integration for code analysis
- Email notifications with review summaries
- Customizable configuration options

## Usage

### Installation

```bash
bun install
```

### Configuration

The project uses a `config.js` file for configuration. You can modify the following options:

- `geminiApiKey`: Your Gemini AI API key.
- `mailService`: Configuration for the email service (see `services/mail.service.js`).

### Running the project

```bash
bun run review.js
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Submit a pull request.

## License

[MIT](https://opensource.org/licenses/MIT)

This project was created using `bun init` in bun v1.2.18. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
