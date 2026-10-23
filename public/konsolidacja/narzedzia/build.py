import csv, glob, json, sys
K='/home/claude/genealog-indexer-v7.1/public/konsolidacja'
S='/home/claude/genealog-indexer-v7.1/public/konsolidacja/narzedzia'
def rd(p): return list(csv.DictReader(open(p,encoding='utf-8-sig',newline=''),delimiter=';'))
ch=[]
for f in sorted(glob.glob(f'{K}/partie/chrzty_partia0*.csv')): ch+=rd(f)
DATA={'ch':ch,'mal':rd(f'{K}/malzenstwa_mal.csv'),'zg':rd(f'{K}/zgony.csv'),'ak':rd(f'{K}/akty_1783_scalone.csv')}
# słownik: (PL, płeć m/k/ob, łacina, rosyjski) — propozycje do zatwierdzenia
D=[
('Jan','m','Ioannes','Иоанн'),('Józef','m','Josephus','Иосиф'),('Wojciech','m','Adalbertus','Адальберт'),
('Tomasz','m','Thomas','Фома'),('Marcin','m','Martinus','Мартин'),('Szymon','m','Simon','Симон'),
('Franciszek','m','Franciscus','Франциск'),('Antoni','m','Antonius','Антоний'),('Andrzej','m','Andreas','Андрей'),
('Jędrzej','m','Andreas','Андрей'),('Mateusz','m','Matthaeus','Матфей'),('Maciej','m','Matthias','Матфей'),
('Łukasz','m','Lucas','Лука'),('Piotr','m','Petrus','Пётр'),('Paweł','m','Paulus','Павел'),
('Jakub','m','Jacobus','Яков'),('Walenty','m','Valentinus','Валентин'),('Wawrzyniec','m','Laurentius','Лаврентий'),
('Stanisław','m','Stanislaus','Станислав'),('Kazimierz','m','Casimirus','Казимир'),('Michał','m','Michael','Михаил'),
('Mikołaj','m','Nicolaus','Николай'),('Grzegorz','m','Gregorius','Григорий'),('Bartłomiej','m','Bartholomaeus','Варфоломей'),
('Dominik','m','Dominicus','Доминик'),('Adam','m','Adamus','Адам'),('Krzysztof','m','Christophorus','Христофор'),
('Kacper','m','Casparus','Каспар'),('Szczepan','m','Stephanus','Стефан'),('Feliks','m','Felix','Феликс'),
('Ignacy','m','Ignatius','Игнатий'),('Onufry','m','Onuphrius','Онуфрий'),('Leonard','m','Leonardus','Леонард'),
('Sebastian','m','Sebastianus','Себастьян'),('Ludwik','m','Ludovicus','Людвик'),('Wincenty','m','Vincentius','Винцент'),
('Jerzy','m','Georgius','Георгий'),('Benedykt','m','Benedictus','Бенедикт'),('Hieronim','m','Hieronymus','Иероним'),
('Aleksander','m','Alexander','Александр'),('Ryszard','m','Richardus','Ричард'),('Dawid','m','David','Давид'),
('Anna','k','Anna','Анна'),('Marianna','k','Maria','Мария'),('Katarzyna','k','Catharina','Екатерина'),
('Zofia','k','Sophia','София'),('Agnieszka','k','Agnes','Агнесса'),('Jadwiga','k','Hedwigis','Ядвига'),
('Barbara','k','Barbara','Варвара'),('Małgorzata','k','Margaretha','Маргарита'),('Rozalia','k','Rosalia','Розалия'),
('Tekla','k','Thecla','Текла'),('Franciszka','k','Francisca','Франциска'),('Magdalena','k','Magdalena','Магдалена'),
('Ewa','k','Eva','Ева'),('Teresa','k','Theresia','Тереза'),('Helena','k','Helena','Елена'),
('Józefa','k','Josepha','Иосифа'),('Elżbieta','k','Elisabetha','Елизавета'),('Joanna','k','Joanna','Иоанна'),
('Salomea','k','Salomea','Саломея'),('Antonina','k','Antonina','Антонина'),('Regina','k','Regina','Регина'),
('Aniela','k','Angela','Анжела'),('Julianna','k','Juliana','Юлиана'),('Konstancja','k','Constantia','Констанция'),
('Cecylia','k','Caecilia','Цецилия'),('Petronela','k','Petronella','Петронелла'),('Zuzanna','k','Susanna','Сусанна'),
('Klara','k','Clara','Клара'),('Dorota','k','Dorothea','Доротея'),('Anastazja','k','Anastasia','Анастасия'),
('Honorata','k','Honorata','Онората'),('Weronika','k','Veronica','Вероника'),('Wiktoria','k','Victoria','Виктория'),
('Florentyna','k','Florentina','Флорентина'),('Feliksa','k','Felicitas','Феликса'),
]
DICT=[{'pl':p,'plec':g,'la':l,'ru':r,'status':'propozycja'} for p,g,l,r in D]
def js(o): return json.dumps(o,ensure_ascii=False).replace('</','<\\/')
tpl=open(f'{S}/edytor_korekt_szablon.html',encoding='utf-8').read()
assert tpl.count('/*DATA*/null')==1 and tpl.count('/*DICT*/[]')==1
out=tpl.replace('/*DATA*/null', js(DATA)).replace('/*DICT*/[]', js(DICT))
dst=sys.argv[1]
open(dst,'w',encoding='utf-8').write(out)
print('ok', dst, len(out)//1024,'KB', 'rows', {k:len(v) for k,v in DATA.items()}, 'dict', len(DICT))
