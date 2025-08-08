-- Create the leaderboard table
create table leaderboard (
  id bigint primary key generated always as identity,
  name text not null check (length(name) = 3),
  score integer not null,
  time integer not null,
  speed numeric(3,1) not null,
  timestamp bigint not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index on score for faster sorting
create index leaderboard_score_idx on leaderboard (score desc);

-- Enable row level security
alter table leaderboard enable row level security;

-- Make the data publicly readable
create policy "public can read leaderboard"
on public.leaderboard
for select to anon
using (true);

-- Make the data publicly insertable
create policy "public can insert leaderboard"
on public.leaderboard
for insert to anon
with check (true);

-- Insert some sample data (optional)
insert into leaderboard (name, score, time, speed, timestamp)
values
  ('AAA', 1500, 45, 2.5, extract(epoch from now()) * 1000),
  ('BBB', 1200, 38, 2.1, extract(epoch from now()) * 1000),
  ('CCC', 900, 30, 1.8, extract(epoch from now()) * 1000); 