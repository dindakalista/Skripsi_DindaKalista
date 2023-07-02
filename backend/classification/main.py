import pandas
import nltk
import re
import os
import joblib

from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.preprocessing import LabelEncoder


# global variable
model = MultinomialNB()
vectorizer = TfidfVectorizer()
x_train = None
x_test = None
x_train_vector = None
x_test_vector = None
y_train = None
y_test = None

# download data stopwords ( hanya perlu dilakukan sekali )
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

# pra-pemrosesan text
def preprocess_text(text):
    # case folding ( mengubah menjadi huruf kecil )
    text = text.lower()

    # menghapus angka
    text = re.sub(r'\d+', '', text)

    # menghapus tanda baca
    text = re.sub(r'[^a-z|\s]', '', text)

    # tokenisasi, memisahkan teks menjadi token ( kata - kata individual )
    tokens = word_tokenize(text)

    # menghapus stopwords ( kata - kata yang umum dan tidak memberikan makna yang signifikan ) dari teks
    stop_words = set(stopwords.words('english'))
    tokens = [word for word in tokens if word not in stop_words]

    # lemmatizing, mengubah kata menjadi bentuk dasar. contoh: running => run
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(word) for word in tokens]

    return ' '.join(tokens)


# pra-pemrosesan file dataset
def preprocess_file(path):
    # membaca file csv
    data = pandas.read_csv(path)
    
    # pra-pemrosesan bug_description ( feature )
    data['bug_description'] = data['bug_description'].apply(preprocess_text)

    # mengubah nilai dev_type ( label ) menjadi angka. frontend => 1, backend => 0
    encoder = LabelEncoder()
    data['dev_type'] = encoder.fit_transform(data['dev_type'])

    # menghapus row kosong
    for index, row in data.iterrows():
        if not row['bug_description'] or row['bug_description'].isspace():
            data.drop(index)

    return data


# melatih model dengan data
def train_model(data):
    # memisahkan bug_description ( feature ) dan dev_type ( label ) dari data
    data_x = data['bug_description']
    data_y = data['dev_type']

    # membagi data menjadi data pelatihan dan data pengujian
    x_train, x_test, y_train, y_test = train_test_split(data_x, data_y, test_size=0.2, random_state=42)

    # transformasi data TF-IDF
    x_train_vector = vectorizer.fit_transform(x_train)
    x_test_vector = vectorizer.transform(x_test)

    # melatih model dengan data
    model.fit(x_train_vector, y_train)

    # print('accuracy', model.score(x_test_vector, y_test))

    # simpan model dan vectorizer ke file
    joblib.dump(model, 'classification/trained/model.pkl')
    joblib.dump(vectorizer, 'classification/trained/vectorizer.pkl')


# mendapatkan prediksi tipe developer berdasarkan deskripsi bug yang diberikan
def get_prediction(description):
    description = vectorizer.transform([description])
    prediction = model.predict(description)

    if prediction[0] == 1: return 'FE'
    if prediction[0] == 0: return 'BE' 


#########################################################################################################################


if os.path.exists('classification/trained/model.pkl') and os.path.exists('classification/trained/vectorizer.pkl'):
    model = joblib.load('classification/trained/model.pkl')
    vectorizer = joblib.load('classification/trained/vectorizer.pkl')
else:
    data = preprocess_file('classification/data/dataset.csv')
    train_model(data)



