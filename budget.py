import json
from flask import Flask, render_template, request
from flask_restful import reqparse, abort, Api, Resource

app = Flask(__name__)
api = Api(app)

#hardcoded budget categories and amounts
cats = [
			{'cat' : 'rent', 'amt' : 700},
			{'cat' : 'food', 'amt' : 200},
			{'cat' : 'gas', 'amt' : 100},
			{'cat' : 'clothes', 'amt' : 100},
			{'cat' : 'miscellaneous', 'amt' : 150},
			{'cat' : 'insurance', 'amt' : 200}, 
			{'cat' : 'loans', 'amt' : 150},
		]

#root: render the main application
@app.route("/")
def root_page():
	return render_template("main.html")

#category resource, will have GET only
class Category(Resource):
	def get(self):
		return cats

#purchase resource, will have GET and POST
class Purchase(Resource):
	def get(self):
		try:
			file = open("purchases.json", 'r')
		except (FileNotFoundError, IOError):
			#create new json file
			file = open("purchases.json", 'w')
			json.dump([], file)
			file.close()

		#return content of purchases.json
		file = open("purchases.json")
		purchases = json.load(file)
		file.close()
		return purchases

	def post(self):
		#get data
		cat = request.form["cat"]
		amt = request.form["amt"]
		date = request.form["date"]
		des = request.form["des"]

		file = open("purchases.json")
		purchases = json.load(file)
		file.close()

		purchases.append({'cat' : cat, 'amt' : amt, 'date' : date, 'des' : des})

		file = open("purchases.json", 'w')
		json.dump(purchases, file)
		file.close()

		return True

#add resources to API
api.add_resource(Category, '/cats')
api.add_resource(Purchase, '/purchases')

if __name__ == '__main__':
	app.run(debug=True)