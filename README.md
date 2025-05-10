## Description

Mining and Structuring Drug Indications from Labels. API that extracts drug indications from DailyMed drug
labels, maps them to standardized medical vocabulary (ICD-10 codes).

## Features
- Parse **DailyMed** drug labels for **Dupixent**, extracting relevant sections that describe **indications**
- Map extracted indications to **ICD-10** codes, handling **synonyms**, **drugs with multiple indications**, and **unmappable conditions** using AI (LLM)

## Running the app

Set the `GOOGLE_GEN_API_KEY=your-google-gen-api-key` in the `.env` file or in your environment variables.

Run:

```bash
$ docker compose up -d
```

Endpoint: `http://localhost:3000/api/indications`

## License

[MIT licensed](LICENSE).
