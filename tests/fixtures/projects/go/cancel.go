package cancel

import "context"

func Wait(ctx context.Context) error {
	<-ctx.Done()
	return ctx.Err()
}
