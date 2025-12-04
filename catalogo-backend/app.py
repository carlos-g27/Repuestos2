# app.py

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS 

# Importar configuración
from config import DATABASE_URL, SECRET_KEY

# Inicialización de la aplicación
app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Habilita CORS (necesario para que tu HTML local pueda hacer peticiones al servidor)
CORS(app) 

db = SQLAlchemy(app)

# --- MODELO DE LA BASE DE DATOS (Representación de la tabla REPUESTOS) ---
class Repuesto(db.Model):
    __tablename__ = 'repuestos'
    
    id = db.Column(db.Integer, primary_key=True) 
    sku_oem = db.Column(db.String(50), unique=True, nullable=False) 
    nombre = db.Column(db.String(150), nullable=False) 
    precio_base = db.Column(db.Numeric(10, 2), nullable=False) 
    modelos_compatibles = db.Column(db.String(255)) 

# --- ENDPOINT (Ruta API) PARA OBTENER EL CATÁLOGO ---
@app.route('/api/repuestos', methods=['GET'])
def get_repuestos():
    search_query = request.args.get('search', '')
    query = Repuesto.query
    
    if search_query:
        search_pattern = f'%{search_query}%'
        query = query.filter(
            (Repuesto.nombre.ilike(search_pattern)) | 
            (Repuesto.sku_oem.ilike(search_pattern)) |
            (Repuesto.modelos_compatibles.ilike(search_pattern))
        )
    
    repuestos_encontrados = query.limit(50).all()
    
    resultado = [{
        'id': r.id,
        'nombre': r.nombre,
        'sku': r.sku_oem,
        'precio': float(r.precio_base),
        'modelos': r.modelos_compatibles if r.modelos_compatibles else "No especificado",
        # CORRECCIÓN: Se utiliza un f-string correcto para la URL de placeholder
        'imagen': f'[https://placehold.co/300x200/505050/ffffff?text=](https://placehold.co/300x200/505050/ffffff?text=){r.sku_oem}' 
    } for r in repuestos_encontrados]
    
    return jsonify(resultado)

# --- RUTAS DE PRUEBA Y UTILIDADES ---
@app.route('/')
def index():
    return 'Servidor API de Catálogo funcionando. Accede a /api/repuestos'

# --- EJECUTAR EL SERVIDOR ---
if __name__ == '__main__':
    # Bloque para crear las tablas automáticamente si no existen
    # Es importante ejecutar esto una sola vez y luego se puede comentar o dejar.
    with app.app_context():
        db.create_all()
    
    # Inicia el servidor
    app.run(host='0.0.0.0', port=5000, debug=True)