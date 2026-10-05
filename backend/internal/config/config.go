package config

import (
	"bufio"
	"errors"
	"os"
	"strings"
)

type Config struct {
	Port           string
	OWMAPIKey      string
	GroqAPIKey     string
	GroqModel      string
	AllowedOrigins []string
}

// Load reads configuration from the environment.
func Load() (Config, error) {
	loadDotEnv(".env", "../.env")

	cfg := Config{
		Port:           getenv("PORT", "8080"),
		OWMAPIKey:      os.Getenv("OWM_API_KEY"),
		GroqAPIKey:     os.Getenv("GROQ_API_KEY"),
		GroqModel:      getenv("GROQ_MODEL", "openai/gpt-oss-20b"),
		AllowedOrigins: splitList(os.Getenv("ALLOWED_ORIGINS")),
	}
	if cfg.OWMAPIKey == "" {
		return Config{}, errors.New("OWM_API_KEY is required")
	}
	return cfg, nil
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func splitList(s string) []string {
	var out []string
	for _, part := range strings.Split(s, ",") {
		if p := strings.TrimSpace(part); p != "" {
			out = append(out, p)
		}
	}
	return out
}

func loadDotEnv(paths ...string) {
	for _, p := range paths {
		f, err := os.Open(p)
		if err != nil {
			continue
		}
		sc := bufio.NewScanner(f)
		for sc.Scan() {
			line := strings.TrimSpace(sc.Text())
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			k, v, ok := strings.Cut(line, "=")
			if !ok {
				continue
			}
			k = strings.TrimSpace(k)
			v = strings.Trim(strings.TrimSpace(v), `"'`)
			if _, exists := os.LookupEnv(k); !exists {
				_ = os.Setenv(k, v)
			}
		}
		_ = f.Close()
		return
	}
}
