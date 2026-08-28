.PHONY: setup dev dev-backend dev-frontend test benchmark seed clean

setup:
	@echo "Setting up Python environment..."
	cd backend && python3 -m venv venv && ./venv/bin/pip install -r requirements.txt
	@echo "Setting up Frontend environment..."
	cd frontend && npm install
	@echo "Setup complete! Remember to configure backend/.env"

seed:
	@echo "Seeding database with synthetic dataset & test scenarios..."
	cd backend && ./venv/bin/python -m app.data.seed_data

dev-backend:
	@echo "Starting FastAPI backend server..."
	cd backend && ./venv/bin/uvicorn app.main:app --reload --port 8000

dev-frontend:
	@echo "Starting Vite frontend dev server..."
	cd frontend && npm run dev

dev:
	@echo "Run dev-backend in one terminal and dev-frontend in another terminal."

test:
	@echo "Running backend test suite..."
	cd backend && ./venv/bin/pytest tests/ -v

benchmark:
	@echo "Running 2,500-transaction empirical recovery benchmark..."
	cd backend && ./venv/bin/python -m app.data.benchmark_eval

docker-up:
	@echo "Launching RazorRecover AI with Docker Compose..."
	docker compose up --build

docker-down:
	@echo "Stopping Docker containers..."
	docker compose down

clean:
	rm -rf backend/__pycache__ backend/app/__pycache__ backend/app/*/__pycache__
	rm -f backend/*.db backend/*.sqlite3
