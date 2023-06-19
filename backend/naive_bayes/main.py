import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

df = pd.read_csv("naive_bayes/dataset.csv")
X = df["bug_description"]
y = df["dev_type"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

vectorizer = CountVectorizer(stop_words="english")
X_train = vectorizer.fit_transform(X_train)
X_test = vectorizer.transform(X_test)

clf = MultinomialNB()
clf.fit(X_train, y_train)

def get_prediction(desc):
    desc = vectorizer.transform([desc])
    pred = clf.predict(desc)

    if pred[0] == 0: return 'FE'
    if pred[0] == 1: return 'BE' 
