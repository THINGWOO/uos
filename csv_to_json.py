import csv
import json

# CSV 파일 이름과 JSON 파일 이름을 지정합니다.
csv_file = 'data_all.csv'
json_file = 'data_all.json'

# CSV 파일을 읽고 JSON 파일에 데이터를 쓰는 함수를 정의합니다.
def csv_to_json(csv_file, json_file):
    with open(csv_file, encoding='cp949') as csvfile:  # 인코딩을 'cp949'로 변경
        csv_reader = csv.DictReader(csvfile)
        data = [row for row in csv_reader]

    with open(json_file, 'w', encoding='utf-8') as jsonfile:
        json.dump(data, jsonfile, ensure_ascii=False, indent=4)

# 함수를 호출하여 변환을 수행합니다.
csv_to_json(csv_file, json_file)
